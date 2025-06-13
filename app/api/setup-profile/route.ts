// app/api/setup-profile/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// POST для завершения настройки профиля
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await request.formData();
        const name = data.get('name') as string;
        const file: File | null = data.get('file') as unknown as File;

        if (!name || !name.trim()) {
             return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        
        const updateData: { name: string; image?: string, isProfileSetupComplete: boolean } = {
            name: name.trim(),
            isProfileSetupComplete: true, // Главное - устанавливаем флаг
        };

        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = await sharp(Buffer.from(bytes))
                .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();

            const fileName = `avatar-${session.user.id}-${Date.now()}.webp`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
            const filePath = path.join(uploadDir, fileName);
            const publicPath = `/uploads/avatars/${fileName}`;

            await mkdir(uploadDir, { recursive: true });
            await writeFile(filePath, buffer);
            updateData.image = publicPath;
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Failed to setup profile:", error);
        return NextResponse.json({ error: 'Failed to setup profile' }, { status: 500 });
    }
}
