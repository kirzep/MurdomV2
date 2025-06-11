// app/api/cats/[id]/audit/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

// GET-запрос для получения логов для одной кошки
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const auditLogs = await prisma.auditLog.findMany({
            where: { catId: params.id },
            take: 5, // Берем только последние 5 записей
            orderBy: { createdAt: 'desc' },
            include: { 
                user: {
                    select: {
                        name: true, // Выбираем только нужные поля
                    }
                } 
            },
        });
        
        return NextResponse.json(auditLogs);
    } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
    }
}
