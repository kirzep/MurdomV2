// app/api/cats/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
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
        return NextResponse.json({ error: 'Failed to fetch cat' }, { status: 500 });
    }
}

// DELETE-запрос (только для персонала)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const allowedRoles = [Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.DEVELOPER];
    if (!session || !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    try {
        const cat = await prisma.cat.findUnique({ where: { id: params.id }, include: { documents: true }});
        if (cat && cat.documents) {
            for (const doc of cat.documents) {
                try {
                    await fs.unlink(path.join(process.cwd(), doc.filePath));
                } catch (fileError) {}
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

// PATCH-запрос с логированием (только для персонала)
export async function PATCH(request: Request, { params }: { params: { id:string } }) {
    const session = await getServerSession(authOptions);
    const allowedRoles = [Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.DEVELOPER];
    if (!session || !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    try {
        const body = await request.json();
        const currentCat = await prisma.cat.findUnique({ where: { id: params.id } });
        if (!currentCat) {
            return NextResponse.json({ error: 'Cat not found' }, { status: 404 });
        }
        let changes: string[] = [];
        if (body.name && body.name !== currentCat.name) changes.push(`имя с '${currentCat.name}' на '${body.name}'`);
        if (body.birthYear && body.birthYear !== currentCat.birthYear) changes.push(`год рождения с '${currentCat.birthYear || '?'}' на '${body.birthYear}'`);
        if (body.arrivalDate && new Date(body.arrivalDate).getTime() !== currentCat.arrivalDate?.getTime()) changes.push(`дату поступления`);
        if (body.avatarUrl && body.avatarUrl !== currentCat.avatarUrl) changes.push('аватар');
        if (body.notes !== undefined && body.notes !== currentCat.notes) changes.push('заметки');

        if (changes.length > 0) {
            const changeDescription = `Пользователь изменил: ${changes.join(', ')}.`;
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
