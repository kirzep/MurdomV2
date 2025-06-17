// app/api/cats/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateAvatar } from '@/lib/utils';
import Fuse from 'fuse.js';
import { Role } from '@prisma/client';

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
            include: { 
                creator: true,
                treatments: true 
            }
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

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
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

// --- ИЗМЕНЕНИЕ: Новый метод DELETE для массового удаления ---
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    const allowedRoles: Role[] = [Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.DEVELOPER];
    if (!session || !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { ids } = await request.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'An array of cat IDs is required' }, { status: 400 });
        }
        
        // ВАЖНО: Мы не можем удалить кошек, которых создал пользователь с более высоким рангом
        // Эту логику нужно будет добавить, если она необходима, сейчас удаление разрешено для всех.

        const deleteResult = await prisma.cat.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        return NextResponse.json({ message: `${deleteResult.count} cats deleted successfully.` });

    } catch (error) {
        console.error("Failed to bulk delete cats:", error);
        return NextResponse.json({ error: 'Failed to delete cats' }, { status: 500 });
    }
}