// app/api/staff/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

// Определяем иерархию ролей (чем меньше число, тем выше ранг)
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
        
        // Нельзя изменять свою собственную роль
        if (session.user.id === targetUserId) {
             return NextResponse.json({ error: "You cannot change your own role." }, { status: 403 });
        }

        const currentUserRank = roleHierarchy[session.user.role];
        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        // Проверяем, имеет ли текущий пользователь право изменять роль целевого пользователя
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
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetUserId = params.id;

    // Нельзя удалять себя
    if (session.user.id === targetUserId) {
        return NextResponse.json({ error: "You cannot delete yourself." }, { status: 403 });
    }
    
    const currentUserRank = roleHierarchy[session.user.role];
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });

    if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Проверяем иерархию для удаления
    if (currentUserRank >= roleHierarchy[targetUser.role]) {
        return NextResponse.json({ error: "Insufficient permissions to delete this user." }, { status: 403 });
    }
    
    // Здесь можно добавить логику переназначения созданных кошек, если это необходимо
    // await prisma.cat.updateMany({ where: { creatorId: targetUserId }, data: { creatorId: null } });

    await prisma.user.delete({ where: { id: targetUserId } });

    return NextResponse.json({ message: 'User deleted successfully' });
}
