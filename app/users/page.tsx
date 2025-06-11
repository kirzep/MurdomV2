// app/users/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { User } from '@/types';
import Spinner from '@/app/components/ui/Spinner';
import { User as UserIcon, Shield } from 'lucide-react';
import Link from 'next/link';

const roleNames = {
    VOLUNTEER: 'Волонтёр',
    MEDICAL_STAFF: 'Мед. персонал',
    TRUSTED_PERSON: 'Доверенное лицо',
};

export default function UserProfilePage() {
    const { id } = useParams();
    const { status: authStatus } = useSession();
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (authStatus === 'authenticated' && id) {
            const fetchUser = async () => {
                try {
                    const res = await fetch(`/api/users/${id}`);
                    if (!res.ok) throw new Error('User not found');
                    const data = await res.json();
                    setUser(data);
                } catch (error) {
                    console.error(error);
                    router.push('/dashboard'); // Если пользователь не найден, возвращаем в архив
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUser();
        }
    }, [id, authStatus, router]);

    if (isLoading || authStatus === 'loading') {
        return <div className="h-screen"><Spinner /></div>;
    }

    if (!user) {
        return <div className="text-center p-8">Пользователь не найден.</div>;
    }

    return (
        <div className="min-h-screen p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-brand-surface/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg">
                    <div className="flex flex-col items-center text-center">
                        <img 
                            src={user.image || `https://placehold.co/128x128/e2e8f0/64748b?text=${user.name.charAt(0)}`}
                            alt={`Аватар ${user.name}`}
                            className="w-32 h-32 rounded-full object-cover mb-4"
                        />
                        <h1 className="text-4xl font-bold text-brand-text-primary">{user.name}</h1>
                        
                        <div className="mt-6 bg-brand-background px-4 py-2 rounded-full flex items-center gap-2 text-brand-text-primary">
                            <Shield size={20} className="text-brand-primary" />
                            <span className="font-semibold">Роль:</span>
                            <span>{roleNames[user.role]}</span>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <Link href="/dashboard" className="text-brand-primary hover:underline font-semibold">
                        Вернуться в архив
                    </Link>
                </div>
            </div>
        </div>
    );
}
