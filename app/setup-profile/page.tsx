// app/setup-profile/page.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Spinner from '@/app/components/ui/Spinner';
import { Save, Camera, Cat, User as UserIcon } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { motion } from 'framer-motion';

export default function SetupProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [name, setName] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (session?.user) {
            if (session.user.isProfileSetupComplete) {
                router.push('/dashboard');
            } else {
                setName(session.user.name ?? 'Новый пользователь');
            }
        }
    }, [session, router]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Имя не может быть пустым');
            return;
        }
        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('name', name);
        if (avatarFile) {
            formData.append('file', avatarFile);
        }

        try {
            const response = await fetch('/api/setup-profile', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Не удалось настроить профиль');
            
            await update();
            
            alert('Профиль успешно настроен! Добро пожаловать!');
            // Используем router.push вместо window.location.href для SPA-навигации
            router.push('/dashboard');

        } catch (err) {
            setError((err as Error).message);
            setIsLoading(false);
        }
    };
    
    if (status === 'loading' || (status === 'authenticated' && session.user.isProfileSetupComplete)) {
        return <div className="h-screen flex items-center justify-center bg-brand-background"><Spinner /></div>
    }

    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-brand-background relative overflow-hidden">
             {/* Фоновые декоративные элементы */}
            <div className="absolute inset-0 pointer-events-none">
                 <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl animate-pulse-slow" />
                 <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                className="w-full max-w-md p-8 space-y-8 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white relative z-10"
            >
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary mb-4 shadow-sm">
                         <Cat size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-brand-text-primary tracking-tight">
                        Добро пожаловать!
                    </h2>
                    <p className="mt-2 text-brand-text-secondary text-sm font-medium">
                        Давайте настроим ваш профиль, чтобы коллеги знали, кто вы.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                     {/* Загрузка аватара */}
                     <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer">
                            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-50 flex items-center justify-center">
                                {avatarPreview ? (
                                    <img 
                                        src={avatarPreview}
                                        alt="Аватар"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <UserIcon size={40} className="text-gray-300" />
                                )}
                            </div>
                            
                            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-primary-hover shadow-md transition-transform hover:scale-110 border-2 border-white">
                                <Camera size={18} />
                            </label>
                            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>
                        <p className="text-xs text-gray-400 mt-2 font-medium">Нажмите на камеру, чтобы загрузить фото</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Ваше имя</label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Имя Фамилия"
                          className="h-14 text-lg"
                          required
                        />
                    </div>
                    
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div>
                        <Button type="submit" className="w-full h-14 text-lg rounded-xl shadow-lg shadow-brand-primary/20" isLoading={isLoading}>
                            <Save size={20} className="mr-2"/>
                            Сохранить и войти
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}