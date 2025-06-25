// app/api/push/notify/route.ts
import { NextResponse } from 'next/server';
import webPush from 'web-push';
import prisma from '@/lib/prisma';
import { getRevaccinationStatus } from '@/lib/revaccinationHelper';
// ИСПРАВЛЕНИЕ: Добавляем импорт Treatment для получения типа vaccinationStage
import { Cat, Role as AppRole, Treatment as AppTreatment, TreatmentType as AppTreatmentType } from '@/types'; 

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
    webPush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
} else {
    console.error("VAPID keys are not configured. Push notifications will not work.");
}

async function findAndSendNotifications() {
    const catsFromDb = await prisma.cat.findMany({
        include: { 
            treatments: true, 
            creator: true 
        }
    });

    const notificationsToSend = new Map<string, { catName: string; dueDate: Date; message: string }[]>();
    
    for (const catDataFromDb of catsFromDb) {
        
        const appCat: Cat = {
            ...catDataFromDb,
            arrivalDate: catDataFromDb.arrivalDate?.toISOString() ?? null,
            createdAt: catDataFromDb.createdAt.toISOString(),
            updatedAt: catDataFromDb.updatedAt.toISOString(),
            creator: catDataFromDb.creator ? {
                ...catDataFromDb.creator,
                role: catDataFromDb.creator.role as AppRole,
            } : null,
            treatments: catDataFromDb.treatments.map(t => ({
                ...t,
                date: t.date.toISOString(),
                createdAt: t.createdAt.toISOString(),
                type: t.type as AppTreatmentType,
                // **ИСПРАВЛЕНИЕ:** Явно приводим тип для vaccinationStage
                vaccinationStage: t.vaccinationStage as AppTreatment['vaccinationStage'],
            }))
        };
        
        const { status, dueDate, message } = getRevaccinationStatus(appCat);

        if (status && dueDate) {
            const userId = appCat.creatorId;
            if (userId) {
                if (!notificationsToSend.has(userId)) {
                    notificationsToSend.set(userId, []);
                }
                notificationsToSend.get(userId)!.push({
                    catName: appCat.name,
                    dueDate: dueDate,
                    message: message
                });
            }
        }
    }
    
    let sentCount = 0;
    
    for (const [userId, alerts] of Array.from(notificationsToSend.entries())) {
        const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
        
        const groupedByMessage = alerts.reduce((acc, alert) => {
            (acc[alert.message] = acc[alert.message] || []).push(alert.catName);
            return acc;
        }, {} as Record<string, string[]>);

        for (const [message, catNames] of Object.entries(groupedByMessage)) {
            const payload = JSON.stringify({
                title: 'Напоминание о вакцинации!',
                body: `${message}: ${catNames.join(', ')}.`,
                icon: '/icons/icon-192x192.png',
                data: { url: '/dashboard' }
            });

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
                        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch((e: any) => console.error(e));
                    } else {
                        console.error('Failed to send notification:', error);
                    }
                }
            }
        }
    }

    return sentCount;
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