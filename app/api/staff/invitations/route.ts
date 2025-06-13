// app/api/staff/invitations/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { randomBytes } from 'crypto';

// POST для создания нового приглашения
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    const allowedRoles: Role[] = [Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.DEVELOPER];
    
    if (!session || !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const token = randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Ссылка действительна 24 часа

        const invitation = await prisma.invitation.create({
            data: {
                token,
                expires,
                createdById: session.user.id,
            },
        });
        
        // ИСПРАВЛЕНИЕ: Используем переменную окружения для создания правильной ссылки
        const appUrl = process.env.NEXTAUTH_URL;
        if (!appUrl) {
            throw new Error("NEXTAUTH_URL is not defined in environment variables.");
        }
        const inviteLink = `${appUrl}/register/${invitation.token}`;

        return NextResponse.json({ inviteLink });

    } catch (error) {
        console.error("Failed to create invitation:", error);
        return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }
}
