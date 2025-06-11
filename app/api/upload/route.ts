// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

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
        const buffer = Buffer.from(bytes);

        // Создаем уникальное имя файла, чтобы избежать конфликтов
        const fileExtension = path.extname(file.name);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
        
        // Путь для сохранения файла
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const filePath = path.join(uploadDir, fileName);
        const publicPath = `/uploads/${fileName}`; // Путь, который будет использоваться на клиенте

        // Проверяем, существует ли папка, и создаем ее, если нет
        await mkdir(uploadDir, { recursive: true });

        // Записываем файл на диск
        await writeFile(filePath, buffer);

        console.log(`File uploaded to: ${filePath}`);

        return NextResponse.json({ 
            success: true, 
            fileName: file.name,
            filePath: publicPath, // Возвращаем публичный путь
            fileType: file.type
        });

    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}
