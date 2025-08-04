// app/api/cats/[id]/photos/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

// GET: Получить все фото для кошки
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const photos = await prisma.photo.findMany({
            where: { catId: params.id },
            orderBy: [{ isAvatar: 'desc' }, { createdAt: 'desc' }],
        });
        return NextResponse.json(photos);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
    }
}

// POST: Загрузить новые фото для кошки
export async function POST(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const allowedRoles: Role[] = [Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.DEVELOPER];
    if (!session || !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { filePaths } = body; // Ожидаем массив путей к файлам

        if (!Array.isArray(filePaths) || filePaths.length === 0) {
            return NextResponse.json({ error: 'File paths are required' }, { status: 400 });
        }

        const photosData = filePaths.map(filePath => ({
            filePath,
            catId: params.id,
        }));

        await prisma.photo.createMany({
            data: photosData,
        });

        await prisma.auditLog.create({
            data: {
                change: `загрузил(а) ${filePaths.length} новых фото в галерею`,
                catId: params.id,
                userId: session.user.id,
            }
        });

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error("Failed to add photos:", error);
        return NextResponse.json({ error: 'Failed to add photos' }, { status: 500 });
    }
}

// DELETE: Массовое удаление фотографий
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const allowedRoles: Role[] = [Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.DEVELOPER];
     if (!session || !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    try {
        const { ids } = await request.json();
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'An array of photo IDs is required' }, { status: 400 });
        }

        const photosToDelete = await prisma.photo.findMany({
            where: { id: { in: ids }, catId: params.id },
        });

        for (const photo of photosToDelete) {
             if (photo.isAvatar) {
                return NextResponse.json({ error: 'You cannot delete the current avatar.' }, { status: 400 });
            }
            try {
                await fs.unlink(path.join(process.cwd(), 'public', photo.filePath));
            } catch (fileError) {
                console.error(`Failed to delete file ${photo.filePath}:`, fileError);
            }
        }

        await prisma.photo.deleteMany({ where: { id: { in: ids } } });

         await prisma.auditLog.create({
            data: {
                change: `удалил(а) ${ids.length} фото из галереи`,
                catId: params.id,
                userId: session.user.id,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete photos:", error);
        return NextResponse.json({ error: 'Failed to delete photos' }, { status: 500 });
    }
}