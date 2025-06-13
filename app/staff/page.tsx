// app/staff/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Role } from '@/types';
import Spinner from '@/app/components/ui/Spinner';
import Link from 'next/link';
import { ArrowLeft, Trash2, Users, BadgeCheck, Copy, Check, Gift } from 'lucide-react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

// Определяем порядок и названия ролей для корректного отображения
const roleOrder: Role[] = [Role.DEVELOPER, Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.VOLUNTEER];
const roleNames: Record<Role, string> = {
    [Role.DEVELOPER]: 'Разработчики',
    [Role.MEDICAL_STAFF]: 'Мед. персонал',
    [Role.TRUSTED_PERSON]: 'Доверенные лица',
    [Role.VOLUNTEER]: 'Волонтёры',
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
    const avatarSrc = user.image ? `${appUrl}${user.image}` : `https://placehold.co/48x48/e2e8f0/64748b?text=${(user.name ?? 'U').charAt(0)}`;
    
    return (
        <div className="p-3 bg-brand-surface rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
                <Link href={`/view-profile/${user.id}`} className="flex items-center gap-4 flex-grow min-w-0">
                    <img src={avatarSrc} alt={user.name ?? 'Пользователь'} className="w-12 h-12 rounded-full object-cover"/>
                    <div className="truncate">
                        <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-brand-text-primary truncate">{user.name}</p>
                            {user.role === Role.DEVELOPER && <BadgeCheck size={18} className="text-blue-500 flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-brand-text-secondary">{roleNames[user.role]}</p>
                    </div>
                </Link>
                
                {canManage && (
                    <div className="hidden sm:flex items-center gap-2 ml-4">
                        <select
                            defaultValue={user.role}
                            onChange={(e) => onRoleChange(user.id, e.target.value as Role)}
                            className="bg-brand-background border-brand-border rounded-md text-sm px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                        {Object.entries(roleNames).map(([roleKey, roleName]) => (
                                roleHierarchyMap[currentUser.role] <= roleHierarchyMap[roleKey as Role] &&
                                <option key={roleKey} value={roleKey}>{roleName}</option>
                            ))}
                        </select>
                         <Button variant="danger" onClick={() => onDelete(user.id)} className="p-2 h-11 w-11">
                            <Trash2 size={22} />
                        </Button>
                    </div>
                )}
            </div>

            {canManage && (
                <div className="sm:hidden flex items-center gap-2 mt-3 pt-3 border-t border-brand-border">
                    <select
                        defaultValue={user.role}
                        onChange={(e) => onRoleChange(user.id, e.target.value as Role)}
                        className="bg-brand-background border-brand-border rounded-md text-sm px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand-primary flex-grow"
                    >
                       {Object.entries(roleNames).map(([roleKey, roleName]) => (
                            roleHierarchyMap[currentUser.role] <= roleHierarchyMap[roleKey as Role] &&
                            <option key={roleKey} value={roleKey}>{roleName}</option>
                        ))}
                    </select>
                     <Button variant="danger" onClick={() => onDelete(user.id)} className="p-2 h-11 w-11 flex-shrink-0">
                        <Trash2 size={22} />
                    </Button>
                </div>
            )}
        </div>
    );
};


// --- Основной компонент страницы ---
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
            if (!res.ok) {
                 throw new Error(`Failed to fetch: ${res.statusText}`);
            }
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
            alert('Не удалось изменить роль. Недостаточно прав.');
            setUsers(originalUsers);
        }
    };
    
    const handleDeleteUser = async (userId: string) => {
        if (confirm('Вы уверены, что хотите удалить этого пользователя? Это действие необратимо.')) {
            const originalUsers = [...users];
            setUsers(users.filter(u => u.id !== userId));
            const res = await fetch(`/api/staff/${userId}`, { method: 'DELETE' });
            if (!res.ok) {
                alert('Не удалось удалить пользователя. Недостаточно прав.');
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
                throw new Error(data.error || 'Не удалось создать ссылку');
            }
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setIsCreatingInvite(false);
        }
    };
    
    // ИСПРАВЛЕНИЕ: Новая, более надежная функция копирования
    const copyToClipboard = () => {
        if (!inviteLink) return;

        // Современный метод, который работает на сайтах с HTTPS
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(inviteLink)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(err => {
                    console.error('Современный метод копирования не удался: ', err);
                    // Если современный метод не сработал, пробуем старый
                    fallbackCopyToClipboard();
                });
        } else {
            // Старый, универсальный метод для HTTP или старых браузеров
            fallbackCopyToClipboard();
        }
    };

    const fallbackCopyToClipboard = () => {
        const textArea = document.createElement("textarea");
        textArea.value = inviteLink;
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Запасной метод копирования не удался: ', err);
            alert('Не удалось скопировать ссылку. Пожалуйста, сделайте это вручную.');
        } finally {
            document.body.removeChild(textArea);
        }
    };

    const groupedUsers = users.reduce((acc, user) => {
        (acc[user.role] = acc[user.role] || []).push(user);
        return acc;
    }, {} as Record<Role, User[]>);

    if (isLoading || status === 'loading') {
        return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
    }
    if (!session) return null;

    const canManageInvites = session.user.role !== Role.VOLUNTEER;

    return (
        <div className="min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-brand-text-primary flex items-center gap-3">
                        <Users size={32}/>
                        Персонал
                    </h1>
                     <Link href="/dashboard" className="text-brand-primary hover:underline font-semibold flex items-center gap-2">
                        <ArrowLeft size={18} />
                        Вернуться в архив
                    </Link>
                </div>
                
                {canManageInvites && (
                    <div className="mb-8 p-4 bg-brand-surface/60 backdrop-blur-sm rounded-xl">
                        <h3 className="font-semibold text-lg mb-2">Пригласить нового пользователя</h3>
                        <p className="text-sm text-brand-text-secondary mb-4">Сгенерируйте одноразовую ссылку для регистрации, которая будет действительна 24 часа.</p>
                        
                        {!inviteLink ? (
                            <Button onClick={createInvite} isLoading={isCreatingInvite}>
                                <Gift size={18} className="mr-2"/> Сгенерировать ссылку
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2 p-2 bg-brand-background rounded-lg">
                                <input type="text" readOnly value={inviteLink} className="w-full bg-transparent outline-none text-sm text-brand-primary" />
                                <Button onClick={copyToClipboard} className="w-32 flex-shrink-0">
                                    {copied ? <Check size={20} className="mr-2" /> : <Copy size={20} className="mr-2" />}
                                    {copied ? 'Готово!' : 'Копировать'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
                        }
                    }}
                    className="space-y-8"
                >
                    {roleOrder.map(role => (
                        groupedUsers[role] && groupedUsers[role].length > 0 && (
                            <motion.section 
                                key={role}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                                }}
                                className="bg-brand-surface/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl"
                            >
                                <h2 className="text-xl font-bold text-brand-text-secondary border-b-2 border-brand-border pb-3 mb-4">{roleNames[role]}</h2>
                                <div className="space-y-3">
                                    {groupedUsers[role].map(user => (
                                        <UserCard 
                                            key={user.id} 
                                            user={user} 
                                            currentUser={session.user as User} 
                                            onRoleChange={handleRoleChange} 
                                            onDelete={handleDeleteUser}
                                        />
                                    ))}
                                </div>
                            </motion.section>
                        )
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
