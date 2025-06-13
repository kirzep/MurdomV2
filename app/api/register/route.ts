// app/api/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

// POST для регистрации нового пользователя по токену
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, token } = body;

        if (!email || !password || !token) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Проверяем токен приглашения
        const invitation = await prisma.invitation.findUnique({
            where: { token: token },
        });

        if (!invitation || invitation.used || new Date() > invitation.expires) {
            return NextResponse.json({ error: 'Invalid or expired invitation token' }, { status: 400 });
        }

        // 2. Проверяем, не занят ли email
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }

        // 3. Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Создаем пользователя и деактивируем токен в одной транзакции
        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: 'Новый пользователь', // Временное имя
                    role: Role.VOLUNTEER, // Роль по умолчанию
                    isProfileSetupComplete: false, // Флаг для завершения настройки
                },
            });

            await tx.invitation.update({
                where: { id: invitation.id },
                data: { used: true },
            });

            return user;
        });

        return NextResponse.json(newUser, { status: 201 });

    } catch (error) {
        console.error("Registration failed:", error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
