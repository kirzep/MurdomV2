// app/profile/page.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Spinner from '@/app/components/ui/Spinner';
import { Role } from '@/types';
import { Shield, Edit, Save, Camera, ArrowLeft, BadgeCheck, Bell, BellOff, LogOut, Zap, Send } from 'lucide-react';
import Link from 'next/link';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const roleNames = {
    VOLUNTEER: 'Волонтёр',
    MEDICAL_STAFF: 'Мед. персонал',
    TRUSTED_PERSON: 'Доверенное лицо',
    DEVELOPER: 'Разработчик',
};

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    // Состояния для профиля
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Состояния для подписок и настроек
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
    const [isSubscriptionEnabled, setIsSubscriptionEnabled] = useState(true);

    // 👇 НОВЫЕ СОСТОЯНИЯ ДЛЯ ПАНЕЛИ РАССЫЛКИ 👇
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

    const getServiceWorkerRegistration = useCallback((): Promise<ServiceWorkerRegistration> => {
        return new Promise((resolve, reject) => {
            if (!('serviceWorker' in navigator)) {
                return reject(new Error('Service Worker не поддерживается.'));
            }
            const timeout = setTimeout(() => {
                reject(new Error('Время ожидания Service Worker истекло.'));
            }, 15000);

            navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then(registration => {
                    if (registration.active) {
                        clearTimeout(timeout);
                        return resolve(registration);
                    }
                    const worker = registration.installing ?? registration.waiting;
                    if (worker) {
                        worker.addEventListener('statechange', () => {
                            if (worker.state === 'activated') {
                                clearTimeout(timeout);
                                resolve(registration);
                            }
                        });
                    }
                })
                .catch(error => {
                    clearTimeout(timeout);
                    reject(error);
                });
        });
    }, []);

    useEffect(() => {
        setName(session?.user.name ?? '');
        const imagePath = session?.user.image ? `${appUrl}${session.user.image}` : null;
        setAvatarPreview(imagePath);
        
        if (status === 'authenticated') {
            if (!('serviceWorker' in navigator && 'PushManager' in window)) {
                setIsSubscriptionEnabled(false);
                setIsSubscriptionLoading(false);
                return;
            }
            getServiceWorkerRegistration()
                .then(reg => reg.pushManager.getSubscription())
                .then(sub => setIsSubscribed(!!sub))
                .catch(error => {
                    console.error("[PROFILE] Error getting initial subscription state:", error);
                    setIsSubscriptionEnabled(false);
                })
                .finally(() => setIsSubscriptionLoading(false));
        }
    }, [session, status, appUrl, getServiceWorkerRegistration]);
    
    // 👇 НОВАЯ ФУНКЦИЯ ДЛЯ ОТПРАВКИ РАССЫЛКИ 👇
    const handleBroadcast = async (e: FormEvent) => {
        e.preventDefault();
        if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
            alert('Заголовок и сообщение не могут быть пустыми.');
            return;
        }

        setIsBroadcasting(true);
        try {
            const response = await fetch('/api/push/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: broadcastTitle,
                    message: broadcastMessage,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error ?? 'Не удалось выполнить рассылку.');
            }
            
            alert('Рассылка успешно отправлена!');
            setBroadcastTitle('');
            setBroadcastMessage('');

        } catch (error) {
            console.error('Broadcast error:', error);
            alert((error as Error).message);
        } finally {
            setIsBroadcasting(false);
        }
    };


    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (session?.user) {
            setName(session.user.name ?? '');
            const imagePath = session.user.image ? `${appUrl}${session.user.image}` : null;
            setAvatarPreview(imagePath);
            setAvatarFile(null);
        }
    }

    const handleProfileUpdate = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        if (avatarFile) {
            formData.append('file', avatarFile);
        }
        try {
            const response = await fetch('/api/profile', { method: 'PATCH', body: formData });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error ?? 'Не удалось обновить профиль');
            }
            await update();
            alert('Профиль успешно обновлен!');
            setIsEditing(false);
            setAvatarFile(null);
        } catch (error) {
            console.error(error);
            alert((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubscriptionToggle = async () => {
        setIsSubscriptionLoading(true);
        try {
            const registration = await getServiceWorkerRegistration();
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Вы не разрешили показ уведомлений.');
            }
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                await existingSubscription.unsubscribe();
                await fetch('/api/push/subscribe', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: existingSubscription.endpoint }),
                });
                setIsSubscribed(false);
                alert('Вы успешно отписались от уведомлений.');
            } else {
                const response = await fetch('/api/push/vapid-key');
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error ?? 'Не удалось получить ключ.');
                }
                const { publicKey } = await response.json();
                const newSubscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey),
                });
                await fetch('/api/push/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newSubscription),
                });
                setIsSubscribed(true);
                alert('Вы успешно подписались на уведомления!');
            }
        } catch (error) {
            console.error('[PROFILE] Subscription toggle error:', error);
            alert(`Не удалось изменить статус подписки: ${(error as Error).message}`);
            navigator.serviceWorker.ready.then(reg => reg.pushManager.getSubscription())
                .then(sub => setIsSubscribed(!!sub))
                .catch(() => setIsSubscribed(false));
        } finally {
            setIsSubscriptionLoading(false);
        }
    };

    const handleSignOut = () => {
        signOut({ callbackUrl: '/login' });
    };

    if (status === 'loading') {
        return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
    }

    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }

    const currentAvatar = avatarPreview ?? `https://placehold.co/128x128/e2e8f0/64748b?text=${(session?.user?.name ?? '?').charAt(0)}`;

    return (
        <div className="min-h-screen p-4 sm:p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="mb-0">
                     <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-brand-secondary text-brand-text-primary hover:bg-brand-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                        <ArrowLeft size={18} />
                        Вернуться в архив
                    </Link>
                </div>

                <form onSubmit={handleProfileUpdate} className="bg-brand-surface/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative w-32 h-32 mb-4">
                            <img 
                                src={currentAvatar}
                                alt="Аватар профиля"
                                className="w-32 h-32 rounded-full object-cover border-4 border-brand-primary-light"
                            />
                            {isEditing && (
                                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-90 transition-all">
                                    <Camera size={22} />
                                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>

                        <div className='flex items-center gap-2'>
                            {isEditing ? (
                                <Input 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="text-4xl font-bold text-center bg-transparent border-0 ring-0 focus:ring-0 p-0"
                                />
                            ) : (
                                <h1 className="text-4xl font-bold text-brand-text-primary">{session?.user.name}</h1>
                            )}
                            {session?.user.role === Role.DEVELOPER && (
                                <BadgeCheck size={32} className="text-blue-500" />
                            )}
                        </div>
                        
                        <p className="text-lg text-brand-text-secondary mt-1">{session?.user.email}</p>

                        <div className="mt-6 bg-brand-background px-4 py-2 rounded-full flex items-center gap-2 text-brand-text-primary">
                            <Shield size={20} className="text-brand-primary" />
                            <span className="font-semibold">Роль:</span>
                            <span>{session?.user.role ? roleNames[session.user.role] : 'Не определена'}</span>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        {isEditing ? (
                            <>
                                <Button type="button" onClick={handleCancelEdit} variant="secondary">
                                    Отмена
                                </Button>
                                <Button type="submit" isLoading={isLoading}>
                                    <Save size={20} className="mr-2"/> Сохранить
                                </Button>
                            </>
                        ) : (
                            <Button type="button" onClick={() => setIsEditing(true)}>
                                <Edit size={20} className="mr-2"/> Редактировать
                            </Button>
                        )}
                         <Button 
                            type="button" 
                            onClick={handleSubscriptionToggle} 
                            variant="secondary"
                            isLoading={isSubscriptionLoading}
                            disabled={!isSubscriptionEnabled || isSubscriptionLoading}
                            title={!isSubscriptionEnabled ? "Функция уведомлений недоступна" : ""}
                            >
                            {isSubscribed ? <BellOff size={20} className="mr-2"/> : <Bell size={20} className="mr-2"/>}
                            {isSubscribed ? 'Уведомления Вкл.' : 'Вкл. уведомления'}
                        </Button>
                        <Button 
                            type="button" 
                            onClick={handleSignOut} 
                            variant="danger"
                        >
                            <LogOut size={20} className="mr-2"/>
                            Выйти
                        </Button>
                    </div>
                </form>

                {/* 👇 НОВАЯ ПАНЕЛЬ ДЛЯ РАЗРАБОТЧИКА 👇 */}
                {session?.user.role === Role.DEVELOPER && (
                    <div className="bg-red-900/10 border border-red-900/20 p-6 rounded-2xl shadow-lg">
                        <h3 className="text-xl font-bold text-red-800 mb-4">Панель разработчика</h3>
                        <form onSubmit={handleBroadcast} className="space-y-4">
                            <div>
                                <label htmlFor="broadcast-title" className="block text-sm font-medium text-brand-text-secondary mb-1">Заголовок рассылки</label>
                                <Input 
                                    id="broadcast-title"
                                    value={broadcastTitle}
                                    onChange={(e) => setBroadcastTitle(e.target.value)}
                                    placeholder="🎉 Вышло обновление!"
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="broadcast-message" className="block text-sm font-medium text-brand-text-secondary mb-1">Сообщение рассылки</label>
                                <textarea
                                    id="broadcast-message"
                                    value={broadcastMessage}
                                    onChange={(e) => setBroadcastMessage(e.target.value)}
                                    placeholder="Опишите, что нового появилось в приложении..."
                                    className="w-full h-24 p-3 bg-brand-background border-brand-border border rounded-lg resize-y focus:ring-2 focus:ring-brand-primary outline-none transition-shadow"
                                    required
                                />
                            </div>
                            <Button type="submit" isLoading={isBroadcasting} variant="danger">
                                <Send size={20} className="mr-2"/>Отправить всем
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}