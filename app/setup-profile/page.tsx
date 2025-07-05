// app/setup-profile/page.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Spinner from '@/app/components/ui/Spinner';
import { Save, Camera, Cat } from 'lucide-react';
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
            window.location.href = '/dashboard';

        } catch (err) {
            setError((err as Error).message);
            setIsLoading(false);
        }
    };
    
    if (status === 'loading' || (status === 'authenticated' && session.user.isProfileSetupComplete)) {
        return <div className="h-screen"><Spinner /></div>
    }

    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }

    return (
        // --- ИЗМЕНЕНИЕ: Обновлен градиент фона под новую тему ---
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-primary-light/30 via-brand-background to-brand-surface">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm p-8 space-y-6 bg-brand-surface rounded-2xl shadow-xl"
            >
                <div className="text-center">
                    <Cat className="mx-auto h-12 w-auto text-brand-primary" />
                    <h2 className="mt-6 text-3xl font-bold text-center text-brand-text-primary">
                        Завершение регистрации
                    </h2>
                    <p className="mt-2 text-center text-sm text-brand-text-secondary">
                        Укажите ваше имя и добавьте аватар
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="relative w-24 h-24 mx-auto">
                        <img 
                            src={avatarPreview || `https://placehold.co/96x96/e2e8f0/64748b?text=${name.charAt(0)}`}
                            alt="Аватар"
                            className="w-24 h-24 rounded-full object-cover"
                        />
                        <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-90 transition-all">
                            <Camera size={18} />
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-center mb-2">Ваше имя</label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Имя Фамилия"
                          required
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <div>
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            <Save size={20} className="mr-2"/>
                            Сохранить и продолжить
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}