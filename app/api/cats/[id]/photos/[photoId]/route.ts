// app/api/cats/[id]/photos/[photoId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

// PATCH: Установить фото как аватар
export async function PATCH(request: Request, { params }: { params: { id: string; photoId: string } }) {
    const session = await getServerSession(authOptions);
    const allowedRoles: Role[] = [Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.DEVELOPER];
    if (!session || !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id: catId, photoId } = params;
        const newAvatar = await prisma.photo.findUnique({ where: { id: photoId } });

        if (!newAvatar || newAvatar.catId !== catId) {
            return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
        }

        // Транзакция для атомарного обновления
        await prisma.$transaction([
            // 1. Убрать флаг isAvatar у старой аватарки
            prisma.photo.updateMany({
                where: { catId: catId, isAvatar: true },
                data: { isAvatar: false },
            }),
            // 2. Установить флаг isAvatar новой аватарке
            prisma.photo.update({
                where: { id: photoId },
                data: { isAvatar: true },
            }),
            // 3. Обновить avatarUrl у самой кошки
            prisma.cat.update({
                where: { id: catId },
                data: { avatarUrl: newAvatar.filePath },
            }),
            // 4. Записать в лог
            prisma.auditLog.create({
                data: {
                    change: 'обновил(а) аватар из галереи',
                    catId: catId,
                    userId: session.user.id,
                }
            })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to set avatar:", error);
        return NextResponse.json({ error: 'Failed to set avatar' }, { status: 500 });
    }
}

// DELETE: Удалить одно фото
export async function DELETE(request: Request, { params }: { params: { id: string; photoId: string } }) {
    const session = await getServerSession(authOptions);
    const allowedRoles: Role[] = [Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.DEVELOPER];
    if (!session || !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id: catId, photoId } = params;

        const photoToDelete = await prisma.photo.findUnique({ where: { id: photoId } });

        if (!photoToDelete || photoToDelete.catId !== catId) {
            return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
        }
        
        if (photoToDelete.isAvatar) {
            return NextResponse.json({ error: 'You cannot delete the current avatar.' }, { status: 400 });
        }

        // Удаляем файл
        try {
            await fs.unlink(path.join(process.cwd(), 'public', photoToDelete.filePath));
        } catch (fileError) {
             console.error(`Failed to delete file ${photoToDelete.filePath}:`, fileError);
        }
        
        // Удаляем запись из БД
        await prisma.photo.delete({ where: { id: photoId } });
        
        await prisma.auditLog.create({
            data: {
                change: `удалил(а) фото из галереи`,
                catId: catId,
                userId: session.user.id,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete photo:", error);
        return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
    }
}