// app/api/cats/[id]/documents/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import fs from 'fs/promises';
import path from 'path';
import { Role } from '@prisma/client';

// POST для добавления записи о документе в БД (только для персонала)
export async function POST(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === Role.VOLUNTEER) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { fileName, filePath, fileType } = body;

        if (!fileName || !filePath || !fileType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const [, newDocument] = await prisma.$transaction([
            prisma.auditLog.create({
                data: {
                    change: `загрузил(а) документ: "${fileName}"`,
                    catId: params.id,
                    userId: session.user.id,
                }
            }),
            prisma.document.create({
                data: {
                    catId: params.id,
                    fileName,
                    filePath,
                    fileType,
                },
            })
        ]);
        
        return NextResponse.json(newDocument, { status: 201 });

    } catch (error) {
        console.error('Failed to add document record:', error);
        return NextResponse.json({ error: 'Failed to add document record' }, { status: 500 });
    }
}

// DELETE для удаления документа (только для персонала)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === Role.VOLUNTEER) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
        return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    try {
        const documentToDelete = await prisma.document.findUnique({
            where: { id: documentId },
        });

        if (documentToDelete) {
            // Удаляем файл с сервера
            try {
                const fullPath = path.join(process.cwd(), documentToDelete.filePath);
                await fs.unlink(fullPath);
            } catch (fileError) {
                 console.error(`Could not delete file ${documentToDelete.filePath}:`, fileError);
            }
    
            // В транзакции создаем лог и удаляем запись из БД
            await prisma.$transaction([
                prisma.auditLog.create({
                    data: {
                        change: `удалил(а) документ: "${documentToDelete.fileName}"`,
                        catId: documentToDelete.catId,
                        userId: session.user.id,
                    }
                }),
                prisma.document.delete({
                    where: { id: documentId },
                })
            ]);
        }

        return NextResponse.json({ message: 'Document deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Failed to delete document:', error);
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }
}
