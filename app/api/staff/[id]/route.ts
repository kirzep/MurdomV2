// app/api/staff/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

const roleHierarchy: Record<Role, number> = {
    DEVELOPER: 0,
    MEDICAL_STAFF: 1,
    TRUSTED_PERSON: 2,
    VOLUNTEER: 3,
};

// PATCH для изменения роли пользователя
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const newRole = body.role as Role;
        const targetUserId = params.id;

        if (!newRole || !Object.values(Role).includes(newRole)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }
        
        if (session.user.id === targetUserId) {
             return NextResponse.json({ error: "You cannot change your own role." }, { status: 403 });
        }

        const currentUserRank = roleHierarchy[session.user.role];
        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        if (currentUserRank >= roleHierarchy[targetUser.role]) {
            return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: { role: newRole },
        });

        return NextResponse.json(updatedUser);

    } catch (error) {
        return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }
}


// DELETE для удаления пользователя
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const allowedRoles: Role[] = [Role.DEVELOPER, Role.MEDICAL_STAFF, Role.TRUSTED_PERSON];
    if (!session || !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const targetUserId = params.id;

    if (session.user.id === targetUserId) {
        return NextResponse.json({ error: "You cannot delete yourself." }, { status: 403 });
    }
    
    const currentUserRank = roleHierarchy[session.user.role];
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });

    if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUserRank >= roleHierarchy[targetUser.role]) {
        return NextResponse.json({ error: "Insufficient permissions to delete this user." }, { status: 403 });
    }
    
    try {
        // ИСПРАВЛЕНИЕ: Перед удалением пользователя, мы обрабатываем все его связи
        await prisma.$transaction([
            // Открепляем созданных кошек (или можно их удалять, если нужно)
            prisma.cat.updateMany({ where: { creatorId: targetUserId }, data: { creatorId: null } }),
            // Удаляем все отправленные им сообщения
            prisma.message.deleteMany({ where: { senderId: targetUserId } }),
            // Удаляем все его записи в логах
            prisma.auditLog.deleteMany({ where: { userId: targetUserId } }),
            // И только потом удаляем самого пользователя
            prisma.user.delete({ where: { id: targetUserId } }),
        ]);
        
        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
         console.error("Failed to delete user and their records:", error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
