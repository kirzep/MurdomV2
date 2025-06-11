// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET-запрос для получения публичного профиля пользователя по ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: { // Выбираем только публичные данные
                id: true,
                name: true,
                role: true,
                image: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
}
