// app/api/staff/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET-запрос для получения списка всех пользователей
export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            // Выбираем только необходимые поля, чтобы не передавать лишние данные
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
            },
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
