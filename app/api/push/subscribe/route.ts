import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const subscription = await request.json();
        
        const existingSubscription = await prisma.pushSubscription.findUnique({
            where: { endpoint: subscription.endpoint },
        });

        if (existingSubscription) {
            return NextResponse.json({ success: true, message: 'Subscription already exists.' }, { status: 200 });
        }
        
        await prisma.pushSubscription.create({
            data: {
                userId: session.user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
        });
        
        return NextResponse.json({ success: true }, { status: 201 });

    } catch (error) {
        console.error("Failed to save subscription", error);
        return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }
}