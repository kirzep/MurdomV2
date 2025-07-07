// app/api/push/broadcast/route.ts
import { NextResponse } from 'next/server';
import webPush from 'web-push';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

// Убедимся, что VAPID ключи настроены
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
    webPush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
}

// Эта функция будет обрабатывать POST-запросы для массовой рассылки
export async function POST(request: Request) {
    console.log('[API PUSH BROADCAST] Получен запрос на массовую рассылку.');

    // 1. Проверка прав доступа: только разработчик может делать рассылку
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== Role.DEVELOPER) {
        console.warn('[API PUSH BROADCAST] Попытка неавторизованного доступа от:', session?.user?.email);
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        // 2. Получаем заголовок и сообщение из тела запроса
        const body = await request.json();
        const { title, message } = body;

        if (!title || !message) {
            return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
        }

        console.log(`[API PUSH BROADCAST] Рассылка с заголовком: "${title}"`);

        // 3. Получаем ВСЕ подписки из базы данных
        const subscriptions = await prisma.pushSubscription.findMany();
        if (subscriptions.length === 0) {
            return NextResponse.json({ message: 'No active subscriptions found.' });
        }

        console.log(`[API PUSH BROADCAST] Найдено ${subscriptions.length} подписок. Начинаем рассылку...`);

        const payload = JSON.stringify({
            title: title,
            body: message,
            icon: '/icons/icon-192x192.png',
            data: { url: '/dashboard' } // URL для открытия по клику
        });

        // 4. Отправляем уведомление каждому подписчику
        const sendPromises = subscriptions.map(sub => {
            const subscriptionObject = {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth }
            };
            return webPush.sendNotification(subscriptionObject, payload)
                .catch(error => {
                    // Если подписка недействительна (например, пользователь удалил сайт из браузера),
                    // удаляем её из нашей базы данных.
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        console.log(`[API PUSH BROADCAST] Удаление недействительной подписки: ${sub.endpoint}`);
                        return prisma.pushSubscription.delete({ where: { id: sub.id } });
                    } else {
                        console.error('Ошибка отправки Push-уведомления:', error);
                    }
                });
        });
        
        await Promise.all(sendPromises);

        console.log('[API PUSH BROADCAST] Рассылка завершена.');
        return NextResponse.json({ success: true, message: `Notifications sent to all subscribers.` });

    } catch (error) {
        console.error("[API PUSH BROADCAST] Ошибка при обработке запроса:", error);
        return NextResponse.json({ error: 'Failed to send broadcast' }, { status: 500 });
    }
}