// app/profile/page.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Spinner from '@/app/components/ui/Spinner';
import { Role } from '@/types';
import { Shield, Edit, Save, Camera, ArrowLeft, BadgeCheck, Bell, BellOff } from 'lucide-react';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';

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

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name ?? '');
            const imagePath = session.user.image ? `${appUrl}${session.user.image}` : null;
            setAvatarPreview(imagePath);
        }

        if (status === 'authenticated') {
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.pushManager.getSubscription().then(sub => {
                        setIsSubscribed(!!sub);
                        setIsSubscriptionLoading(false);
                    });
                }).catch(error => {
                    console.error("Service worker ready error:", error);
                    setIsSubscriptionLoading(false);
                });
            } else {
                console.warn('Push notifications are not supported in this browser.');
                setIsSubscriptionLoading(false);
            }
        }
    }, [session, status, appUrl]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
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
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Не удалось обновить профиль');
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
        if (!('serviceWorker' in navigator && 'PushManager' in window)) {
            alert('Push-уведомления не поддерживаются в вашем браузере.');
            return;
        }

        setIsSubscriptionLoading(true);

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert('Вы не разрешили показ уведомлений. Чтобы включить их, измените настройки сайта в браузере.');
                return;
            }

            const registration = await navigator.serviceWorker.ready;
            const existingSubscription = await registration.pushManager.getSubscription();

            if (existingSubscription) {
                await existingSubscription.unsubscribe();
                setIsSubscribed(false);
                alert('Вы успешно отписались от уведомлений.');
            } else {
                const response = await fetch('/api/push/vapid-key');
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Не удалось получить ключ для подписки с сервера.');
                }
                const { publicKey } = await response.json();
                const applicationServerKey = urlBase64ToUint8Array(publicKey);

                const newSubscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey,
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
            console.error('Failed to toggle subscription: ', error);
            alert(`Не удалось изменить статус подписки: ${(error as Error).message}`);
        } finally {
            setIsSubscriptionLoading(false);
        }
    };

    if (status === 'loading') {
        return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
    }

    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }

    const currentAvatar = avatarPreview || `https://placehold.co/128x128/e2e8f0/64748b?text=${(session?.user?.name ?? '?').charAt(0)}`;

    return (
        <div className="min-h-screen p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                {/* ИЗМЕНЕНИЕ 2: Применяем стиль кнопки к ссылке */}
                <div className="mb-8">
                     <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-brand-secondary text-brand-text-primary hover:bg-brand-secondary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
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
                            >
                            {isSubscribed ? <BellOff size={20} className="mr-2"/> : <Bell size={20} className="mr-2"/>}
                            {isSubscribed ? 'Уведомления Вкл.' : 'Вкл. уведомления'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}