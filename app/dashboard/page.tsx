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
import ChatWidget from '../components/ChatWidget';
import LoadingScreen from '../components/LoadingScreen';
import PatchNotesModal from '../components/PatchNotesModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const getRandomDuration = () => Math.floor(Math.random() * (6000 - 3000 + 1)) + 3000;

const CURRENT_APP_VERSION = '1.1.0';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Состояние для приветственного экрана инициализируется из sessionStorage
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('hasSeenLoadingScreen');
    }
    return true; // По умолчанию показываем на сервере
  });
  
  const [loadingDuration, setLoadingDuration] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [cats, setCats] = useState<Cat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 400);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  
  const canEdit = 
    session?.user.role === Role.MEDICAL_STAFF || 
    session?.user.role === Role.TRUSTED_PERSON ||
    session?.user.role === Role.DEVELOPER;

  // Логика для экрана загрузки и патчноутов
  useEffect(() => {
    if (showWelcomeScreen) {
      const duration = getRandomDuration();
      setLoadingDuration(duration);
      const timer = setTimeout(() => {
        setShowWelcomeScreen(false);
        sessionStorage.setItem('hasSeenLoadingScreen', 'true');
      }, duration);
      return () => clearTimeout(timer);
    } else {
        const lastSeenVersion = localStorage.getItem('appVersion');
        if (lastSeenVersion !== CURRENT_APP_VERSION) {
            setShowPatchNotes(true);
        }
    }
  }, [showWelcomeScreen]);

  const handleClosePatchNotes = () => {
    setShowPatchNotes(false);
    localStorage.setItem('appVersion', CURRENT_APP_VERSION);
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
  }, [status, debouncedSearchQuery, router]);

  const handleCatAdded = (newCat: Cat) => {
      setCats(prevCats => [newCat, ...prevCats]);
  }

  // Пока идет проверка сессии, показываем основной спиннер
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
      
      {/* Модальные окна теперь не зависят от основного контента */}
      <PatchNotesModal isOpen={showPatchNotes} onClose={handleClosePatchNotes} version={CURRENT_APP_VERSION} />
      <SidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
      {canEdit && <AddCatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCatAdded={handleCatAdded} />}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      
      {/* Основной контент будет виден только после исчезновения экрана загрузки */}
      {!showWelcomeScreen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen"
        >
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
            {isDataLoading ? (
               <div className="h-64 flex items-center justify-center"><Spinner /></div>
            ) : (
              <AnimatePresence>
                  {cats.length > 0 ? (
                      <motion.div 
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      >
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
