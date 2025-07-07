// app/api/cats/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';
import { Role } from '@prisma/client';

// GET-запрос (доступен всем)
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const cat = await prisma.cat.findUnique({
            where: { id: params.id },
            include: {
                treatments: true,
                documents: true,
                creator: true,
            },
        });
        if (!cat) return NextResponse.json({ error: 'Cat not found' }, { status: 404 });
        return NextResponse.json(cat);
    } catch (error) {
        console.error("Failed to fetch cat:", error);
        return NextResponse.json({ error: 'Failed to fetch cat' }, { status: 500 });
    }
}

// DELETE-запрос (только для персонала)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const allowedRoles: Role[] = [Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.DEVELOPER];
    if (!session || !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    try {
        const cat = await prisma.cat.findUnique({ where: { id: params.id }, include: { documents: true }});
        if (cat?.documents) {
            for (const doc of cat.documents) {
                try {
                    await fs.unlink(path.join(process.cwd(), 'public', doc.filePath));
                } catch (fileError) {
                    // Исправлена ошибка S2486: добавлено логирование
                    console.error(`Could not delete file ${doc.filePath}:`, fileError);
                }
            }
        }
        await prisma.$transaction([
            prisma.auditLog.deleteMany({ where: { catId: params.id } }),
            prisma.cat.delete({ where: { id: params.id } }),
        ]);
        return NextResponse.json({ message: 'Cat deleted successfully' });
    } catch (error) {
        console.error("Failed to delete cat:", error);
        return NextResponse.json({ error: 'Failed to delete cat' }, { status: 500 });
    }
}

// Вспомогательная функция для создания описания изменений
const createChangeDescription = (currentCat: any, body: any): string => {
    const changes: string[] = [];
    const fieldsToCompare = [
        { key: 'name', label: 'имя' },
        { key: 'birthYear', label: 'год рождения' },
        { key: 'status', label: 'статус' }
    ];

    fieldsToCompare.forEach(({ key, label }) => {
        if (body[key] !== undefined && body[key] !== currentCat[key]) {
            changes.push(`${label} с '${currentCat[key] ?? '?'}' на '${body[key]}'`);
        }
    });
    
    if (body.arrivalDate && new Date(body.arrivalDate).getTime() !== currentCat.arrivalDate?.getTime()) {
        changes.push(`дату поступления`);
    }
    if (body.avatarUrl && body.avatarUrl !== currentCat.avatarUrl) {
        changes.push('аватар');
    }
    if (body.notes !== undefined && body.notes !== currentCat.notes) {
        changes.push('заметки');
    }

    return changes.length > 0 ? `изменил(а): ${changes.join(', ')}` : '';
};


// PATCH-запрос с логированием (только для персонала)
export async function PATCH(request: Request, { params }: { params: { id:string } }) {
    const session = await getServerSession(authOptions);
    const allowedRoles: Role[] = [Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.DEVELOPER];
    if (!session || !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    try {
        const body = await request.json();
        // Исправлена ошибка TS2353: убираем `select`, чтобы получить полный объект кошки
        const currentCat = await prisma.cat.findUnique({ where: { id: params.id } });

        if (!currentCat) {
            return NextResponse.json({ error: 'Cat not found' }, { status: 404 });
        }
        
        const changeDescription = createChangeDescription(currentCat, body);

        if (changeDescription) {
            await prisma.auditLog.create({
                data: { change: changeDescription, catId: params.id, userId: session.user.id }
            });
        }

        const updatedCat = await prisma.cat.update({ where: { id: params.id }, data: body });
        return NextResponse.json(updatedCat);
    } catch (error) {
        console.error("Failed to update cat:", error);
        return NextResponse.json({ error: 'Failed to update cat' }, { status: 500 });
    }
}