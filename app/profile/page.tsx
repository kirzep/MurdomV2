// app/profile/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Spinner from '@/app/components/ui/Spinner';
import { Role } from '@/types';
import { Shield, Edit, Save, Camera, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';

const roleNames = {
    VOLUNTEER: 'Волонтёр',
    MEDICAL_STAFF: 'Мед. персонал',
    TRUSTED_PERSON: 'Доверенное лицо',
    DEVELOPER: 'Разработчик',
};

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (session?.user) {
            // ИСПРАВЛЕНИЕ: Добавляем запасное значение для имени
            setName(session.user.name ?? '');
            setAvatarPreview(session.user.image || null);
        }
    }, [session]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setAvatarPreview(session.user.image || null);
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

    if (status === 'loading') {
        return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
    }

    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }

    return (
        <div className="min-h-screen p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-4">
                     <Link href="/dashboard" className="flex items-center gap-2 text-brand-primary hover:underline font-semibold w-fit">
                        <ArrowLeft size={18} />
                        Вернуться в архив
                    </Link>
                </div>

                <form onSubmit={handleProfileUpdate} className="bg-brand-surface/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative w-32 h-32 mb-4">
                            <img 
                                src={avatarPreview || `https://placehold.co/128x128/e2e8f0/64748b?text=${name.charAt(0)}`}
                                alt="Аватар профиля"
                                className="w-32 h-32 rounded-full object-cover"
                            />
                            {isEditing && (
                                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-90 transition-all">
                                    <Camera size={22} />
                                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>

                        {isEditing ? (
                            <Input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="text-4xl font-bold text-center bg-transparent border-0 ring-0 focus:ring-0 p-0"
                            />
                        ) : (
                            <h1 className="text-4xl font-bold text-brand-text-primary">{session?.user.name}</h1>
                        )}
                        
                        <p className="text-lg text-brand-text-secondary mt-1">{session?.user.email}</p>

                        <div className="mt-6 bg-brand-background px-4 py-2 rounded-full flex items-center gap-2 text-brand-text-primary">
                            <Shield size={20} className="text-brand-primary" />
                            <span className="font-semibold">Роль:</span>
                            <span>{session?.user.role ? roleNames[session.user.role] : 'Не определена'}</span>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center gap-4">
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
                    </div>
                </form>
            </div>
        </div>
    );
}
