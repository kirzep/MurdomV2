// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Cat, Role } from '@/types';
import CatCard from './CatCard';
import Spinner from '../components/ui/Spinner';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Search, Plus, LogOut, CatIcon as FelineIcon, Menu, MessageCircle } from 'lucide-react';
import AddCatModal from './AddCatModal';
import { AnimatePresence, motion } from 'framer-motion';
import { useDebounce } from 'use-debounce';
import SidePanel from '../components/SidePanel';
import ChatWidget from '../components/ChatWidget'; // Импортируем чат

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [cats, setCats] = useState<Cat[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 400);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // Состояние для чата
  
  const canEdit = session?.user.role === Role.MEDICAL_STAFF || session?.user.role === Role.TRUSTED_PERSON;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchCats = async () => {
        try {
          const response = await fetch(`/api/cats?q=${debouncedSearchQuery}`);
          const data = await response.json();
          setCats(data);
        } catch (error) {
          console.error('Ошибка при загрузке кошек:', error);
        } finally {
          setIsDataLoading(false);
        }
      };
      fetchCats();
    }
  }, [status, debouncedSearchQuery]);

  const handleCatAdded = (newCat: Cat) => {
      setCats(prevCats => [newCat, ...prevCats]);
  }

  if (status === 'loading' || isDataLoading) {
    return <div className="h-screen"><Spinner /></div>;
  }
  
  if (status === 'unauthenticated') return null;

  return (
    <>
      <SidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
      {canEdit && <AddCatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCatAdded={handleCatAdded} />}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      
      <div className="min-h-screen">
        <header className="bg-brand-surface/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Button onClick={() => setIsPanelOpen(true)} variant="secondary" className="p-2 h-12 w-12 rounded-full">
                        <Menu size={28} />
                      </Button>
                      <h1 className="text-xl md:text-2xl font-bold text-brand-primary flex items-center gap-2">
                        <FelineIcon size={28}/>
                        <span className="hidden sm:inline">Архив</span>
                      </h1>
                    </div>
                    <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-lg mx-2">
                        <Input 
                            placeholder="Поиск..."
                            icon={<Search size={22}/>}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {canEdit && (
                          <Button onClick={() => setIsModalOpen(true)} className="p-2 h-12 w-12 sm:w-auto sm:px-4 rounded-full sm:rounded-lg">
                              <Plus size={26} className="sm:mr-2"/> 
                              <span className="hidden sm:inline">Добавить</span>
                          </Button>
                        )}
                        <Button variant="secondary" onClick={() => signOut({ callbackUrl: '/login' })} className="p-2 h-12 w-12 rounded-full">
                            <LogOut size={26} />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
        
        <main className="container mx-auto p-4">
            <AnimatePresence>
                {cats.length > 0 ? (
                    <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cats.map(cat => (
                            <CatCard key={cat.id} cat={cat} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center py-20">
                        <h2 className="text-2xl font-semibold text-brand-text-primary">Кошек пока нет</h2>
                        {canEdit && <p className="text-brand-text-secondary mt-2">Нажмите "Добавить", чтобы создать первую запись.</p>}
                    </motion.div>
                )}
             </AnimatePresence>
        </main>

        <div className="fixed bottom-6 right-6 z-40">
            <Button className="h-16 w-16 rounded-full shadow-lg" onClick={() => setIsChatOpen(true)}>
                <MessageCircle size={32} />
            </Button>
        </div>
      </div>
    </>
  );
}
