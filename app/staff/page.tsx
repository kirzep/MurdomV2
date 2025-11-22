// app/staff/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Role } from '@/types';
import Spinner from '@/app/components/ui/Spinner';
import Link from 'next/link';
import { ArrowLeft, Trash2, Users, BadgeCheck, Copy, Check, Gift, Shield, UserPlus, ChevronDown } from 'lucide-react';
import Button from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

// Конфигурация ролей
const roleConfig: Record<Role, { label: string; color: string; border: string; icon: string }> = {
    [Role.DEVELOPER]: { label: 'Разработчики', color: 'text-violet-600 bg-violet-50', border: 'border-violet-200', icon: '⚡' },
    [Role.MEDICAL_STAFF]: { label: 'Мед. персонал', color: 'text-rose-600 bg-rose-50', border: 'border-rose-200', icon: '🩺' },
    [Role.TRUSTED_PERSON]: { label: 'Доверенные лица', color: 'text-blue-600 bg-blue-50', border: 'border-blue-200', icon: '🛡️' },
    [Role.VOLUNTEER]: { label: 'Волонтёры', color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-200', icon: '🌱' },
};

const roleHierarchyMap: Record<Role, number> = {
    DEVELOPER: 0, MEDICAL_STAFF: 1, TRUSTED_PERSON: 2 , VOLUNTEER: 3,
};

const UserCard = ({ user, currentUser, onRoleChange, onDelete }: { 
    user: User;
    currentUser: User;
    onRoleChange: (userId: string, newRole: Role) => void;
    onDelete: (userId: string) => void;
}) => {
    const canManage = currentUser.id !== user.id && roleHierarchyMap[currentUser.role] < roleHierarchyMap[user.role];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const avatarSrc = user.image ? `${appUrl}${user.image}` : `https://placehold.co/100x100/e2e8f0/64748b?text=${(user.name ?? 'U').charAt(0)}`;
    
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-white/80 backdrop-blur-sm border border-white shadow-sm hover:shadow-md rounded-2xl p-4 transition-all duration-300"
        >
            <div className="flex items-center gap-4">
                {/* Аватар */}
                <Link href={`/view-profile/${user.id}`} className="relative shrink-0">
                    <img 
                        src={avatarSrc} 
                        alt={user.name ?? 'Пользователь'} 
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm transition-transform group-hover:scale-105"
                    />
                    <div className="absolute -bottom-1 -right-1 text-lg drop-shadow-sm">
                        {roleConfig[user.role].icon}
                    </div>
                </Link>

                {/* Информация */}
                <div className="min-w-0 flex-1">
                    <Link href={`/view-profile/${user.id}`} className="block group-hover:opacity-80 transition-opacity">
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-gray-800 truncate">{user.name}</h3>
                            {user.role === Role.DEVELOPER && <BadgeCheck size={16} className="text-violet-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </Link>
                </div>

                {/* Управление (Десктоп) */}
                {canManage && (
                    <div className="hidden sm:flex items-center gap-2">
                         <div className="relative group/select">
                            <select
                                value={user.role}
                                onChange={(e) => onRoleChange(user.id, e.target.value as Role)}
                                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold py-2 pl-3 pr-8 rounded-xl cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                            >
                                {Object.keys(roleConfig).map((roleKey) => (
                                    roleHierarchyMap[currentUser.role] <= roleHierarchyMap[roleKey as Role] &&
                                    <option key={roleKey} value={roleKey}>{roleConfig[roleKey as Role].label}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                         </div>
                         
                         <button 
                            onClick={() => onDelete(user.id)} 
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Удалить пользователя"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Управление (Мобильные) */}
            {canManage && (
                <div className="sm:hidden mt-4 pt-3 border-t border-gray-100 flex justify-between items-center gap-3">
                    <div className="relative flex-1">
                        <select
                            value={user.role}
                            onChange={(e) => onRoleChange(user.id, e.target.value as Role)}
                            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold py-2 pl-3 pr-8 rounded-xl"
                        >
                            {Object.keys(roleConfig).map((roleKey) => (
                                roleHierarchyMap[currentUser.role] <= roleHierarchyMap[roleKey as Role] &&
                                <option key={roleKey} value={roleKey}>{roleConfig[roleKey as Role].label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                     <button 
                        onClick={() => onDelete(user.id)} 
                        className="p-2 text-red-400 hover:text-red-600 bg-red-50 rounded-xl transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default function StaffPage() {
    const { data: session, status } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreatingInvite, setIsCreatingInvite] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/staff');
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchUsers();
        }
    }, [status]);
    
    const handleRoleChange = async (userId: string, newRole: Role) => {
        const originalUsers = [...users];
        setUsers(users.map(u => u.id === userId ? {...u, role: newRole} : u));
        const res = await fetch(`/api/staff/${userId}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ role: newRole }),
        });
        if(!res.ok) {
            alert('Ошибка изменения роли.');
            setUsers(originalUsers);
        }
    };
    
    const handleDeleteUser = async (userId: string) => {
        if (confirm('Удалить пользователя?')) {
            const originalUsers = [...users];
            setUsers(users.filter(u => u.id !== userId));
            const res = await fetch(`/api/staff/${userId}`, { method: 'DELETE' });
            if (!res.ok) {
                alert('Ошибка удаления.');
                setUsers(originalUsers);
            }
        }
    };

    const createInvite = async () => {
        setIsCreatingInvite(true);
        setInviteLink('');
        try {
            const res = await fetch('/api/staff/invitations', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                setInviteLink(data.inviteLink);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setIsCreatingInvite(false);
        }
    };
    
    const copyToClipboard = () => {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => alert('Скопируйте вручную'));
    };

    // Группировка пользователей по ролям в нужном порядке
    const groupedUsers = [Role.DEVELOPER, Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.VOLUNTEER].reduce((acc, role) => {
        const roleUsers = users.filter(u => u.role === role);
        if (roleUsers.length > 0) {
            acc.push({ role, users: roleUsers });
        }
        return acc;
    }, [] as { role: Role, users: User[] }[]);


    if (isLoading || status === 'loading') {
        return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
    }
    if (!session) return null;

    const canManageInvites = session.user.role !== Role.VOLUNTEER;

    return (
        <div className="min-h-screen p-4 sm:p-8 pb-24">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Шапка */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 bg-white/50 hover:bg-white rounded-xl transition-colors text-gray-500">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Команда</h1>
                            <p className="text-gray-500 text-sm font-medium">{users.length} участников</p>
                        </div>
                    </div>
                </div>
                
                {/* Блок приглашений */}
                {canManageInvites && (
                    <div className="bg-gradient-to-br from-brand-primary/5 to-indigo-50/50 border border-indigo-100 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                             <UserPlus size={120} />
                        </div>
                        
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold text-brand-primary mb-2 flex items-center gap-2">
                                <Gift size={20} />
                                Пригласить коллегу
                            </h2>
                            <p className="text-gray-600 text-sm mb-6 max-w-md">
                                Сгенерируйте уникальную ссылку-приглашение. Она будет действительна 24 часа и позволит создать новый аккаунт.
                            </p>
                            
                            {!inviteLink ? (
                                <Button onClick={createInvite} isLoading={isCreatingInvite} className="rounded-xl h-12 px-6 shadow-lg shadow-brand-primary/20">
                                    Создать ссылку
                                </Button>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
                                    <div className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 font-mono truncate flex items-center select-all">
                                        {inviteLink}
                                    </div>
                                    <Button onClick={copyToClipboard} variant={copied ? 'secondary' : 'primary'} className="rounded-xl h-full sm:w-auto w-full">
                                        {copied ? <Check size={18} className="mr-2" /> : <Copy size={18} className="mr-2" />}
                                        {copied ? 'Скопировано' : 'Копировать'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Списки пользователей */}
                <div className="space-y-10">
                    {groupedUsers.map(({ role, users }) => (
                        <section key={role}>
                            <div className="flex items-center gap-3 mb-4 px-2">
                                <div className={`p-2 rounded-xl ${roleConfig[role].color}`}>
                                    <Shield size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">{roleConfig[role].label}</h3>
                                <span className="text-sm font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                                    {users.length}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {users.map(user => (
                                    <UserCard 
                                        key={user.id} 
                                        user={user} 
                                        currentUser={session.user as User} 
                                        onRoleChange={handleRoleChange} 
                                        onDelete={handleDeleteUser}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}