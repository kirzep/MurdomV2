// app/api/chat/messages/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET для получения всех сообщений чата
export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const messages = await prisma.message.findMany({
            take: 100,
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: { id: true, name: true, image: true } // Добавляем image
                }
            }
        });
        return NextResponse.json(messages);
    } catch (error) {
        console.error("Failed to fetch messages:", error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}


// POST для отправки нового сообщения в общий чат
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const newMessage = await prisma.message.create({
            data: {
                content,
                sender: { connect: { id: session.user.id } }
            },
        });

        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        console.error("Failed to send message:", error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
