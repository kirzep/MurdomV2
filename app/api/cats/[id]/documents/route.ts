// app/api/cats/[id]/documents/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';
import { Role } from '@prisma/client';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    // ... (код POST остается без изменений)
    const session = await getServerSession(authOptions);
    const allowedRoles: Role[] = [Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.DEVELOPER];
    if (!session || !allowedRoles.includes(session.user.role)) {
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
                    catId: params.id, userId: session.user.id,
                }
            }),
            prisma.document.create({ data: { catId: params.id, fileName, filePath, fileType }})
        ]);
        return NextResponse.json(newDocument, { status: 201 });
    } catch (error) {
        console.error('Failed to add document record:', error);
        return NextResponse.json({ error: 'Failed to add document record' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const allowedRoles: Role[] = [Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.DEVELOPER];
    if (!session || !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // --- ИЗМЕНЕНИЕ: Поддержка и одиночного, и массового удаления ---
    const { searchParams } = new URL(request.url);
    const singleDocumentId = searchParams.get('documentId');
    let idsToDelete: string[] = [];

    if (singleDocumentId) {
        idsToDelete = [singleDocumentId];
    } else {
        const { ids } = await request.json();
        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ error: 'An array of document IDs is required' }, { status: 400 });
        }
        idsToDelete = ids;
    }
    
    if (idsToDelete.length === 0) {
        return NextResponse.json({ message: 'No documents to delete' });
    }

    try {
        const documentsToDelete = await prisma.document.findMany({
            where: { id: { in: idsToDelete } },
        });

        for (const doc of documentsToDelete) {
            try {
                await fs.unlink(path.join(process.cwd(), 'public', doc.filePath));
            } catch (fileError) {
                console.error(`Failed to delete file ${doc.filePath}:`, fileError);
            }
        }
    
        await prisma.document.deleteMany({ where: { id: { in: idsToDelete } } });
        
        // Логирование (опционально, можно сделать более детальным)
        await prisma.auditLog.create({
            data: {
                change: `удалил(а) ${documentsToDelete.length} документ(ов)`,
                catId: params.id, userId: session.user.id,
            }
        });

        return NextResponse.json({ message: 'Documents deleted successfully' });
    } catch (error) {
        console.error('Failed to delete document(s):', error);
        return NextResponse.json({ error: 'Failed to delete document(s)' }, { status: 500 });
    }
}