// app/api/push/notify/route.ts
import { NextResponse } from 'next/server';
import webPush from 'web-push';
import prisma from '@/lib/prisma';
import { getRevaccinationStatus } from '@/lib/revaccinationHelper';
import { Cat, Role as AppRole, Treatment as AppTreatment, TreatmentType as AppTreatmentType, CatStatus } from '@/types'; 

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
    webPush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
} else {
    console.error("VAPID keys are not configured. Push notifications will not work.");
}

/**
 * Преобразует данные о кошке из Prisma в тип, используемый в приложении.
 */
function toAppCat(catFromDb: any): Cat {
    return {
        ...catFromDb,
        status: catFromDb.status as CatStatus,
        arrivalDate: catFromDb.arrivalDate?.toISOString() ?? null,
        createdAt: catFromDb.createdAt.toISOString(),
        updatedAt: catFromDb.updatedAt.toISOString(),
        creator: catFromDb.creator ? {
            ...catFromDb.creator,
            role: catFromDb.creator.role as AppRole,
        } : null,
        treatments: catFromDb.treatments.map((t: any) => ({
            ...t,
            date: t.date.toISOString(),
            createdAt: t.createdAt.toISOString(),
            type: t.type as AppTreatmentType,
            vaccinationStage: t.vaccinationStage as AppTreatment['vaccinationStage'],
        }))
    };
}

/**
 * Вспомогательная функция для отправки уведомлений по списку подписок.
 * Это уменьшает вложенность в основной функции.
 */
async function sendPayloadToSubscriptions(subscriptions: any[], payload: string): Promise<number> {
    let sentCount = 0;
    for (const sub of subscriptions) {
        try {
            const subscriptionObject = {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth }
            };
            await webPush.sendNotification(subscriptionObject, payload);
            sentCount++;
        } catch (error: any) {
            if (error.statusCode === 410 || error.statusCode === 404) {
                // Если подписка истекла или не найдена, удаляем её из базы.
                await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(e => console.error(e));
            } else {
                console.error('Failed to send notification:', error);
            }
        }
    }
    return sentCount;
}

/**
 * Основная функция, которая находит и отправляет уведомления.
 * Теперь она менее сложная, так как логика отправки вынесена.
 */
async function findAndSendNotifications() {
    const catsFromDb = await prisma.cat.findMany({
        include: { treatments: true, creator: true }
    });

    const appCats = catsFromDb.map(toAppCat);
    
    const notificationsByUser = appCats.reduce((acc, cat) => {
        const { status, message } = getRevaccinationStatus(cat);
        if (status && cat.creatorId) {
            if (!acc[cat.creatorId]) {
                acc[cat.creatorId] = [];
            }
            acc[cat.creatorId].push({ catName: cat.name, message });
        }
        return acc;
    }, {} as Record<string, { catName: string; message: string }[]>);

    let totalSentCount = 0;
    
    for (const userId in notificationsByUser) {
        const userAlerts = notificationsByUser[userId];
        const userSubscriptions = await prisma.pushSubscription.findMany({ where: { userId } });

        if (userSubscriptions.length === 0) continue;

        const groupedByMessage = userAlerts.reduce((acc, alert) => {
            if (!acc[alert.message]) {
                acc[alert.message] = [];
            }
            acc[alert.message].push(alert.catName);
            return acc;
        }, {} as Record<string, string[]>);

        for (const [message, catNames] of Object.entries(groupedByMessage)) {
            const payload = JSON.stringify({
                title: 'Напоминание о вакцинации!',
                body: `${message}: ${catNames.join(', ')}.`,
                icon: '/icons/icon-192x192.png',
                data: { url: '/dashboard' }
            });
            totalSentCount += await sendPayloadToSubscriptions(userSubscriptions, payload);
        }
    }

    return totalSentCount;
}


export async function GET() {
    if (!process.env.VAPID_PUBLIC_KEY) {
        return NextResponse.json({ error: 'VAPID keys not configured.' }, { status: 500 });
    }
    try {
        const count = await findAndSendNotifications();
        return NextResponse.json({ message: `Successfully sent ${count} notifications.` });
    } catch (error) {
        console.error("Error in /api/push/notify:", error);
        return NextResponse.json({ error: 'Failed to process and send notifications' }, { status: 500 });
    }
}