// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// PATCH для обновления профиля текущего пользователя
export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await request.formData();
        const name = data.get('name') as string;
        const file: File | null = data.get('file') as unknown as File;
        
        const updateData: { name?: string; image?: string } = {};

        if (name && name.trim()) {
            updateData.name = name.trim();
        }

        // Если приложен новый файл аватара, загружаем его
        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileExtension = path.extname(file.name);
            const fileName = `avatar-${session.user.id}-${Date.now()}${fileExtension}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
            const filePath = path.join(uploadDir, fileName);
            const publicPath = `/uploads/avatars/${fileName}`;

            await mkdir(uploadDir, { recursive: true });
            await writeFile(filePath, buffer);
            updateData.image = publicPath;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No data to update' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Failed to update profile:", error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
