// app/api/push/notify/route.ts
import { NextResponse } from 'next/server';
import webPush from 'web-push';
import prisma from '@/lib/prisma';
import { addYears, addDays, subDays, isWithinInterval, isPast, isToday as isTodayFns } from 'date-fns';
import { Treatment, TreatmentType } from '@prisma/client';

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
    const cats = await prisma.cat.findMany({
        include: { treatments: true, creator: true }
    });

    const notificationsToSend = new Map<string, { catName: string; dueDate: Date }[]>();
    const now = new Date();
    const checkStartDate = subDays(now, 30); 
    const checkEndDate = addDays(now, 14);

    for (const cat of cats) {
        const allVaccinations = (cat.treatments || [])
            .filter((t: Treatment) => t.type === TreatmentType.VACCINATION)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (allVaccinations.length > 0) {
            const lastVaccinationDate = new Date(allVaccinations[0].date);
            const revaccinationDueDate = addYears(lastVaccinationDate, 1);
            
            if (isWithinInterval(revaccinationDueDate, { start: checkStartDate, end: checkEndDate })) {
                const userId = cat.creatorId;
                if (userId) {
                    if (!notificationsToSend.has(userId)) {
                        notificationsToSend.set(userId, []);
                    }
                    notificationsToSend.get(userId)!.push({
                        catName: cat.name,
                        dueDate: revaccinationDueDate
                    });
                }
            }
        }
    }
    
    let sentCount = 0;
    
    // --- ИСПРАВЛЕНИЕ: Оборачиваем итератор в Array.from() для совместимости с ES5 ---
    for (const [userId, alerts] of Array.from(notificationsToSend.entries())) {
        const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
        const payload = JSON.stringify({
            title: 'Напоминание о ревакцинации!',
            body: `Скоро ревакцинация у: ${alerts.map((a: {catName: string}) => a.catName).join(', ')}.`,
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