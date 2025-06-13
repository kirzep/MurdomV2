// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import sharp from 'sharp';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const originalBuffer = Buffer.from(bytes);

        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        let finalBuffer: Buffer;
        let finalFileName: string;
        let finalFileType: string;

        if (file.type.startsWith('image/')) {
            // ИСПРАВЛЕНИЕ: Конвертируем изображение в JPEG вместо WebP
            finalBuffer = await sharp(originalBuffer)
                .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 85 }) // Устанавливаем формат и качество
                .toBuffer();
            finalFileName = `${uniqueName}.jpeg`;
            finalFileType = 'image/jpeg';
        } else {
            finalBuffer = originalBuffer;
            const fileExtension = path.extname(file.name);
            finalFileName = `${uniqueName}${fileExtension}`;
            finalFileType = file.type;
        }
        
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const filePath = path.join(uploadDir, finalFileName);
        const publicPath = `/uploads/${finalFileName}`;

        await mkdir(uploadDir, { recursive: true });
        await writeFile(filePath, finalBuffer);

        console.log(`File processed and uploaded to: ${filePath}`);

        return NextResponse.json({ 
            success: true, 
            fileName: file.name,
            filePath: publicPath,
            fileType: finalFileType
        });

    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}
