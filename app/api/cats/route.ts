// app/api/cats/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateAvatar } from '@/lib/utils';
import Fuse from 'fuse.js';
import { Role } from '@prisma/client';

// GET-запрос для получения всех кошек (доступен всем)
export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q');
    try {
        const allCats = await prisma.cat.findMany({
            orderBy: { createdAt: 'desc' },
            include: { creator: true }
        });
        if (!searchQuery) {
            return NextResponse.json(allCats);
        }
        const fuse = new Fuse(allCats, { keys: ['name'], threshold: 0.4 });
        return NextResponse.json(fuse.search(searchQuery).map(item => item.item));
    } catch (error) {
        console.error("Failed to fetch cats:", error);
        return NextResponse.json({ error: 'Failed to fetch cats' }, { status: 500 });
    }
}

// POST-запрос для добавления новой кошки
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    // ИСПРАВЛЕНИЕ: Явно указываем тип массива
    const allowedRoles: Role[] = [Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.DEVELOPER];
    if (!session || !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    try {
        const body = await request.json();
        const { name, avatarUrl, arrivalDate, birthYear } = body;
        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        const newCat = await prisma.cat.create({
            data: {
                name,
                avatarUrl: avatarUrl || generateAvatar(name),
                arrivalDate: arrivalDate,
                birthYear: birthYear,
                creatorId: session.user.id,
            },
            include: { creator: true }
        });
        return NextResponse.json(newCat, { status: 201 });
    } catch (error) {
        console.error("Failed to create cat:", error);
        return NextResponse.json({ error: 'Failed to create cat' }, { status: 500 });
    }
}
