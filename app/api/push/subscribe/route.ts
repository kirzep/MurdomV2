// app/api/push/subscribe/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Обработчик POST-запроса для создания новой подписки на push-уведомления.
 * @param request - Входящий запрос, содержащий данные подписки.
 * @returns NextResponse с результатом операции.
 */
export async function POST(request: Request) {
    console.log('[API PUSH SUBSCRIBE] Received POST request.');
    
    const session = await getServerSession(authOptions);
    if (!session) {
        console.error('[API PUSH SUBSCRIBE] Unauthorized: No session found.');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('[API PUSH SUBSCRIBE] User authenticated:', session.user.email);

    try {
        const subscription = await request.json();
        console.log('[API PUSH SUBSCRIBE] Request body:', JSON.stringify(subscription, null, 2));
        
        const existingSubscription = await prisma.pushSubscription.findUnique({
            where: { endpoint: subscription.endpoint },
        });

        if (existingSubscription) {
            console.log('[API PUSH SUBSCRIBE] Subscription already exists for endpoint:', subscription.endpoint);
            return NextResponse.json({ success: true, message: 'Subscription already exists.' }, { status: 200 });
        }
        
        console.log('[API PUSH SUBSCRIBE] Creating new subscription...');
        await prisma.pushSubscription.create({
            data: {
                userId: session.user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
        });
        console.log('[API PUSH SUBSCRIBE] Successfully created new subscription.');
        
        return NextResponse.json({ success: true }, { status: 201 });

    } catch (error) {
        console.error("[API PUSH SUBSCRIBE] Failed to save subscription:", error);
        return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }
}


/**
 * Обработчик DELETE-запроса для удаления существующей подписки.
 * Это необходимо, когда пользователь отписывается от уведомлений.
 * @param request - Входящий запрос, содержащий endpoint подписки для удаления.
 * @returns NextResponse с результатом операции.
 */
export async function DELETE(request: Request) {
    console.log('[API PUSH SUBSCRIBE] Received DELETE request.');
    
    const session = await getServerSession(authOptions);
    if (!session) {
        console.error('[API PUSH SUBSCRIBE] Unauthorized: No session found for DELETE.');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('[API PUSH SUBSCRIBE] User authenticated for DELETE:', session.user.email);

    try {
        const { endpoint } = await request.json();
        console.log('[API PUSH SUBSCRIBE] Endpoint to delete:', endpoint);

        if (!endpoint) {
             console.error('[API PUSH SUBSCRIBE] Endpoint is required for DELETE.');
             return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
        }
        
        console.log('[API PUSH SUBSCRIBE] Deleting subscription from DB...');
        await prisma.pushSubscription.delete({
            where: { endpoint: endpoint },
        });
        console.log('[API PUSH SUBSCRIBE] Successfully deleted subscription.');
        
        return NextResponse.json({ success: true, message: 'Subscription deleted successfully.' });

    } catch (error) {
        if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
            console.warn('[API PUSH SUBSCRIBE] Subscription to delete not found, probably already deleted.');
            return NextResponse.json({ success: true, message: 'Subscription not found, already deleted.' });
        }

        console.error("[API PUSH SUBSCRIBE] Failed to delete subscription:", error);
        return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
    }
}
