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

        // ИСПРАВЛЕНИЕ: Добавляем блок try...catch для обработки неизвестных форматов
        try {
            if (file.type.startsWith('image/') && file.type !== 'image/heic' && file.type !== 'image/heif') {
                // Обрабатываем только известные и поддерживаемые форматы
                finalBuffer = await sharp(originalBuffer)
                    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 85 })
                    .toBuffer();
                finalFileName = `${uniqueName}.jpeg`;
                finalFileType = 'image/jpeg';
            } else {
                // Если формат неизвестен (например, HEIC), сохраняем как есть
                throw new Error("Unsupported format for optimization, saving original.");
            }
        } catch (error) {
            // Если sharp не смог обработать файл, сохраняем оригинал
            console.log("Sharp processing failed, saving original file:", error);
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
