// app/users/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { User, Role } from '@/types';
import Spinner from '@/app/components/ui/Spinner';
import { Shield, ArrowLeft, BadgeCheck, User as UserIcon, Mail, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Конфигурация ролей (дублируем для автономности компонента или можно вынести в утилиты)
const roleConfig: Record<Role, { label: string; color: string; border: string; icon: string }> = {
    [Role.DEVELOPER]: { label: 'Разработчик', color: 'text-violet-600 bg-violet-50', border: 'border-violet-200', icon: '⚡' },
    [Role.MEDICAL_STAFF]: { label: 'Мед. персонал', color: 'text-rose-600 bg-rose-50', border: 'border-rose-200', icon: '🩺' },
    [Role.TRUSTED_PERSON]: { label: 'Доверенное лицо', color: 'text-blue-600 bg-blue-50', border: 'border-blue-200', icon: '🛡️' },
    [Role.VOLUNTEER]: { label: 'Волонтёр', color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-200', icon: '🌱' },
};

export default function PublicUserProfilePage() {
    const { id } = useParams();
    const { status: authStatus } = useSession();

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    useEffect(() => {
        if (authStatus === 'authenticated' && id) {
            const fetchUser = async () => {
                try {
                    const res = await fetch(`/api/get-user-profile?id=${id}`);
                    if (!res.ok) throw new Error('User not found');
                    const data = await res.json();
                    setUser(data);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUser();
        }
    }, [id, authStatus]);

    const handleCopyEmail = () => {
        if (user?.email) {
            navigator.clipboard.writeText(user.email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading || authStatus === 'loading') {
        return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-brand-background">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <UserIcon size={40} className="text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Пользователь не найден</h2>
                <p className="text-gray-500 mb-8">Возможно, ссылка устарела или профиль был удален.</p>
                <Link href="/staff" className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-primary-hover transition-all">
                    Вернуться к списку
                </Link>
            </div>
        );
    }
    
    const avatarSrc = user.image 
      ? `${appUrl}${user.image}` 
      : `https://placehold.co/256x256/e2e8f0/64748b?text=${user.name.charAt(0)}`;

    const roleInfo = roleConfig[user.role];

    return (
        <div className="min-h-screen p-4 sm:p-8 pb-24 flex flex-col items-center justify-center relative bg-brand-background overflow-hidden">
            {/* Фоновые декоративные элементы */}
            <div className="absolute inset-0 pointer-events-none">
                 <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl animate-pulse-slow" />
                 <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                className="w-full max-w-lg relative z-10"
            >
                 {/* Кнопка назад */}
                 <div className="mb-6">
                     <Link href="/staff" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all bg-white/60 backdrop-blur-md border border-white text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md shadow-sm group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Команда</span>
                    </Link>
                </div>

                {/* Основная карточка */}
                <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] overflow-hidden">
                    
                    {/* Верхняя часть с градиентом */}
                    <div className={`h-32 bg-gradient-to-r ${user.role === Role.DEVELOPER ? 'from-violet-50 to-indigo-50' : 'from-gray-50 to-gray-100'} border-b border-gray-200 relative`}>
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
                    </div>

                    <div className="px-8 pb-10 text-center relative">
                        {/* Аватар */}
                        <div className="-mt-16 mb-5 relative inline-block">
                            <div className="p-1.5 bg-white rounded-full shadow-xl">
                                <img 
                                    src={avatarSrc}
                                    alt={`Аватар ${user.name}`}
                                    className="w-32 h-32 rounded-full object-cover border border-gray-100"
                                />
                            </div>
                            {/* Иконка роли */}
                            <div className="absolute bottom-1 right-1 bg-white rounded-full p-2 shadow-lg border border-gray-100 text-xl" title={roleInfo.label}>
                                {roleInfo.icon}
                            </div>
                        </div>

                        {/* Имя и Роль */}
                        <div className="flex flex-col items-center gap-3 mb-8">
                            <div className="flex items-center gap-2 justify-center">
                                <h1 className="text-3xl sm:text-4xl font-black text-gray-800 tracking-tight leading-tight">
                                    {user.name}
                                </h1>
                                {user.role === Role.DEVELOPER && (
                                    <BadgeCheck size={28} className="text-violet-500 shrink-0" />
                                )}
                            </div>
                            
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm text-xs font-bold uppercase tracking-wider ${roleInfo.color} ${roleInfo.border}`}>
                                <Shield size={14} />
                                <span>{roleInfo.label}</span>
                            </div>
                        </div>

                        {/* Контакты */}
                        <div className="space-y-3">
                            {user.email ? (
                                <div 
                                    onClick={handleCopyEmail}
                                    className="group flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-brand-primary/30 hover:bg-brand-primary/5 cursor-pointer transition-all active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-brand-primary shadow-sm transition-colors shrink-0">
                                            <Mail size={20} />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                                            <p className="text-sm font-semibold text-gray-700 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-brand-primary transition-colors pl-2">
                                        {copied ? <Check size={20} /> : <Copy size={20} />}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 border-dashed text-center">
                                    <p className="text-sm text-gray-400 italic">Контакты скрыты</p>
                                </div>
                            )}

                            {/* ID для справки */}
                            <div className="flex justify-center pt-4 opacity-40 hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                    <UserIcon size={10} />
                                    <span>ID: {user.id}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </motion.div>
        </div>
    );
}