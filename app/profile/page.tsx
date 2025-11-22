// app/profile/page.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Spinner from '@/app/components/ui/Spinner';
import { Role } from '@/types';
import { Shield, Edit, Save, Camera, ArrowLeft, BadgeCheck, Bell, BellOff, LogOut, Zap, Send, User as UserIcon, Mail } from 'lucide-react';
import Link from 'next/link';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { motion } from 'framer-motion';
import InstallPWAButton from '@/app/components/InstallPWAButton'; // Импортируем кнопку

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

    // Состояния для панели рассылки
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

    const currentAvatar = avatarPreview ?? `https://placehold.co/256x256/e2e8f0/64748b?text=${(session?.user?.name ?? '?').charAt(0)}`;

    return (
        <div className="min-h-screen p-4 sm:p-8 pb-28">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Кнопка назад */}
                <div className="flex items-center">
                     <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all bg-white/80 backdrop-blur-md border border-white text-brand-text-primary hover:bg-white hover:shadow-md shadow-sm">
                        <ArrowLeft size={18} />
                        <span className="hidden sm:inline">Вернуться в архив</span>
                    </Link>
                </div>

                {/* Основная карточка профиля */}
                <form onSubmit={handleProfileUpdate}>
                    <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white shadow-xl rounded-[2.5rem] p-8 sm:p-10">
                        
                        {/* Декоративный фон */}
                        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none h-48" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            {/* Аватар */}
                            <div className="relative group mb-6">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 bg-white shadow-xl">
                                    <img 
                                        src={currentAvatar}
                                        alt="Аватар профиля"
                                        className="w-full h-full rounded-full object-cover border-4 border-brand-primary/10"
                                    />
                                </div>
                                {isEditing && (
                                    <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-primary-hover shadow-lg transition-transform hover:scale-110 border-2 border-white">
                                        <Camera size={20} />
                                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>

                            {/* Имя и Роль */}
                            <div className="flex flex-col items-center gap-2 mb-6 w-full">
                                {isEditing ? (
                                    <input 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="text-3xl sm:text-4xl font-black text-center bg-transparent border-b-2 border-brand-primary/30 focus:border-brand-primary outline-none px-2 py-1 text-gray-800 w-full max-w-md"
                                        placeholder="Ваше имя"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <h1 className="text-3xl sm:text-4xl font-black text-gray-800">{session?.user.name}</h1>
                                        {session?.user.role === Role.DEVELOPER && (
                                            <BadgeCheck size={28} className="text-blue-500" />
                                        )}
                                    </div>
                                )}
                                
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <Shield size={14} className="text-brand-primary" />
                                    <span>{session?.user.role ? roleNames[session.user.role] : 'Не определена'}</span>
                                </div>
                            </div>
                            
                            {/* Почта */}
                            <div className="flex items-center gap-2 text-gray-500 bg-gray-50/50 px-4 py-2 rounded-xl border border-gray-100 mb-8">
                                <Mail size={16} />
                                <span className="text-sm font-medium">{session?.user.email}</span>
                            </div>

                            {/* Кнопки действий */}
                            <div className="flex flex-wrap justify-center gap-3 w-full">
                                {isEditing ? (
                                    <>
                                        <Button type="button" onClick={handleCancelEdit} variant="secondary" className="rounded-xl h-12 px-6">
                                            Отмена
                                        </Button>
                                        <Button type="submit" isLoading={isLoading} className="rounded-xl h-12 px-8 shadow-lg shadow-brand-primary/20">
                                            <Save size={20} className="mr-2"/> Сохранить
                                        </Button>
                                    </>
                                ) : (
                                    <Button type="button" onClick={() => setIsEditing(true)} className="rounded-xl h-12 px-8 shadow-lg shadow-brand-primary/20">
                                        <Edit size={20} className="mr-2"/> Редактировать
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Дополнительные настройки (Уведомления, PWA, Выход) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubscriptionToggle}
                        disabled={!isSubscriptionEnabled || isSubscriptionLoading}
                        className={`
                            flex items-center justify-between p-5 rounded-[2rem] border shadow-sm transition-all text-left
                            ${isSubscribed 
                                ? 'bg-emerald-50/80 border-emerald-100 hover:bg-emerald-100' 
                                : 'bg-white/80 border-white hover:bg-white'}
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${isSubscribed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                {isSubscribed ? <Bell size={24} /> : <BellOff size={24} />}
                            </div>
                            <div>
                                <h3 className={`font-bold ${isSubscribed ? 'text-emerald-900' : 'text-gray-800'}`}>
                                    Уведомления
                                </h3>
                                <p className={`text-xs font-medium ${isSubscribed ? 'text-emerald-700' : 'text-gray-500'}`}>
                                    {isSubscribed ? 'Включены' : 'Отключены'}
                                </p>
                            </div>
                        </div>
                        {isSubscriptionLoading && <Spinner />}
                    </motion.button>

                    {/* Кнопка установки приложения */}
                    <InstallPWAButton />

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSignOut}
                        className="flex items-center justify-between p-5 rounded-[2rem] border border-red-100 bg-red-50/50 hover:bg-red-50 shadow-sm transition-all text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-red-100 text-red-500">
                                <LogOut size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-red-900">Выйти</h3>
                                <p className="text-xs font-medium text-red-700">Завершить сеанс</p>
                            </div>
                        </div>
                    </motion.button>
                </div>

                {/* Панель разработчика (Только для DEV) */}
                {session?.user.role === Role.DEVELOPER && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900 text-gray-200 p-6 rounded-[2rem] shadow-2xl border border-gray-700 overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap size={100} />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2 bg-indigo-500 rounded-lg text-white">
                                <Zap size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Консоль Создателя</h3>
                        </div>

                        <form onSubmit={handleBroadcast} className="space-y-4 relative z-10">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Заголовок</label>
                                <input 
                                    value={broadcastTitle}
                                    onChange={(e) => setBroadcastTitle(e.target.value)}
                                    placeholder="Важное объявление"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Сообщение</label>
                                <textarea
                                    value={broadcastMessage}
                                    onChange={(e) => setBroadcastMessage(e.target.value)}
                                    placeholder="Текст для всех пользователей..."
                                    rows={3}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isBroadcasting}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isBroadcasting ? <Spinner /> : <Send size={18} />}
                                <span>Отправить всем</span>
                            </button>
                        </form>
                    </motion.div>
                )}
            </div>
        </div>
    );
}