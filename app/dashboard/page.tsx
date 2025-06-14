// app/dashboard/page.tsx (ИЗМЕНЕН)
"use client";

import { useState, useEffect, useMemo } from 'react';
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
import ChatWidget from '../components/ChatWidget';
import LoadingScreen from '../components/LoadingScreen';
import PatchNotesModal from '../components/PatchNotesModal';
import RevaccinationAlerts from './RevaccinationAlerts';
import RevaccinationModal from './RevaccinationModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const getRandomDuration = () => Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000;

const CURRENT_APP_VERSION = '1.1.3'; // Обновляем версию

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [showWelcomeScreen, setShowWelcomeScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('hasSeenLoadingScreen');
    }
    return true;
  });
  
  const [loadingDuration, setLoadingDuration] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [cats, setCats] = useState<Cat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 400);
  
  // Состояния модальных окон
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false); // Состояние для модалки с алертами
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  
  const canEdit = 
    session?.user.role === Role.MEDICAL_STAFF || 
    session?.user.role === Role.TRUSTED_PERSON ||
    session?.user.role === Role.DEVELOPER;
    
  const filteredCats = useMemo(() => {
    if (!searchQuery) return cats;
    return cats.filter(cat => cat.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
  }, [cats, debouncedSearchQuery, searchQuery]);

  useEffect(() => {
    if (showWelcomeScreen) {
      const duration = getRandomDuration();
      setLoadingDuration(duration);
      const timer = setTimeout(() => {
        setShowWelcomeScreen(false);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('hasSeenLoadingScreen', 'true');
        }
      }, duration);
      return () => clearTimeout(timer);
    } else {
        const lastSeenVersion = typeof window !== 'undefined' ? localStorage.getItem('appVersion') : null;
        if (lastSeenVersion !== CURRENT_APP_VERSION) {
            setShowPatchNotes(true);
        }
    }
  }, [showWelcomeScreen]);

  const handleClosePatchNotes = () => {
    setShowPatchNotes(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('appVersion', CURRENT_APP_VERSION);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      const fetchCats = async () => {
        setIsDataLoading(true);
        try {
          const response = await fetch(`/api/cats`);
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
  }, [status, router]);

  const handleCatAdded = (newCat: Cat) => {
      setCats(prevCats => [newCat, ...prevCats]);
  }

  if (status === 'loading') {
    return <div className="h-screen"><Spinner /></div>;
  }

  return (
    <>
      <AnimatePresence>
        {showWelcomeScreen && session?.user && (
          <LoadingScreen userName={session.user.name ?? 'Гость'} duration={loadingDuration} />
        )}
      </AnimatePresence>
      
      <PatchNotesModal isOpen={showPatchNotes} onClose={handleClosePatchNotes} version={CURRENT_APP_VERSION} />
      <SidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
      {canEdit && <AddCatModal isOpen={isAddCatModalOpen} onClose={() => setIsAddCatModalOpen(false)} onCatAdded={handleCatAdded} />}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <RevaccinationModal isOpen={isAlertsModalOpen} onClose={() => setIsAlertsModalOpen(false)} cats={cats} />
      
      {!showWelcomeScreen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen"
        >
          <header className="bg-brand-surface/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Button onClick={() => setIsPanelOpen(true)} variant="secondary" className="p-2 h-12 w-12 rounded-full">
                        <Menu size={28} />
                      </Button>
                      <h1 className="text-xl md:text-2xl font-bold text-brand-primary flex items-center gap-2">
                        <FelineIcon size={28}/>
                        <span className="hidden sm:inline">Архив</span>
                      </h1>
                    </div>
                    <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-lg">
                        <Input 
                            placeholder="Поиск..."
                            icon={<Search size={22}/>}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {canEdit && (
                          <Button onClick={() => setIsAddCatModalOpen(true)} className="p-2 h-12 w-12 sm:w-auto sm:px-4 rounded-full sm:rounded-lg">
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
             {/* Передаем cats и обработчик клика в баннер */}
             <RevaccinationAlerts cats={cats} onClick={() => setIsAlertsModalOpen(true)} />

            {isDataLoading ? (
               <div className="h-64 flex items-center justify-center"><Spinner /></div>
            ) : (
              <AnimatePresence>
                  {filteredCats.length > 0 ? (
                      <motion.div 
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                      >
                          {filteredCats.map(cat => (
                              <CatCard key={cat.id} cat={cat} />
                          ))}
                      </motion.div>
                  ) : (
                      <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center py-20">
                          <h2 className="text-2xl font-semibold text-brand-text-primary">Кошек по вашему запросу не найдено</h2>
                          <p className="text-brand-text-secondary mt-2">Попробуйте изменить поисковый запрос.</p>
                      </motion.div>
                  )}
               </AnimatePresence>
            )}
          </main>
          
          <div className="fixed bottom-6 right-6 z-40">
              <Button className="h-16 w-16 rounded-full shadow-lg" onClick={() => setIsChatOpen(true)}>
                  <MessageCircle size={32} />
              </Button>
          </div>
        </motion.div>
      )}
    </>
  );
}