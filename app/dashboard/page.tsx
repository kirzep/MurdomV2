// app/dashboard/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Cat, Role } from '@/types';
import CatCard from './CatCard';
import Spinner from '../components/ui/Spinner';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
// --- ИЗМЕНЕНИЕ: Убираем иконку Menu ---
import { Search, Plus, MessageCircle, X, Trash2, Sparkles, CatIcon as FelineIcon } from 'lucide-react';
import AddCatModal from './AddCatModal';
import { AnimatePresence, motion } from 'framer-motion';
import { useDebounce } from 'use-debounce';
// --- ИЗМЕНЕНИЕ: Убираем SidePanel ---
import ChatWidget from '../components/ChatWidget';
import LoadingScreen from '../components/LoadingScreen';
import PatchNotesModal from '../components/PatchNotesModal';
import RevaccinationAlerts from './RevaccinationAlerts';
import RevaccinationModal from './RevaccinationModal';
import { getRevaccinationStatus, RevaccinationInfo } from '@/lib/revaccinationHelper';
import MurdomAiWidget from '../components/AiAssistantWidget';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const getRandomDuration = () => Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000;
const CURRENT_APP_VERSION = '2.0.1'; // Пример новой версии

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
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  // --- ИЗМЕНЕНИЕ: Убираем состояние для боковой панели ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  
  const canEdit = session?.user.role !== Role.VOLUNTEER;
  const canUseAiAssistant = session?.user.role === Role.MEDICAL_STAFF || session?.user.role === Role.TRUSTED_PERSON || session?.user.role === Role.DEVELOPER;
    
  const filteredCats = useMemo(() => {
    if (!searchQuery) return cats;
    return cats.filter(cat => cat.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
  }, [cats, debouncedSearchQuery, searchQuery]);

  const vaccinationAlerts = useMemo(() => {
    return cats
      .map(cat => {
        const alert = getRevaccinationStatus(cat);
        return alert.status ? { cat, alert } : null;
      })
      .filter((item): item is { cat: Cat; alert: RevaccinationInfo } => item !== null);
  }, [cats]);

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

  const fetchCats = useCallback(async () => {
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
  }, [debouncedSearchQuery]);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchCats();
    }
  }, [status, router, fetchCats]);

  const handleCatAdded = (newCat: Cat) => {
      setCats(prevCats => [newCat, ...prevCats]);
  }

  const handleStartSelectionMode = useCallback((catId: string) => {
    setIsSelectionMode(true);
    setSelectedCats([catId]);
  }, []);

  const handleToggleSelection = useCallback((catId: string) => {
    setSelectedCats(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  }, []);
  
  useEffect(() => {
    if (isSelectionMode && selectedCats.length === 0) {
        setIsSelectionMode(false);
    }
  }, [selectedCats, isSelectionMode]);

  const handleCancelSelection = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedCats([]);
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedCats.length === 0) return;
    if (confirm(`Вы уверены, что хотите удалить ${selectedCats.length} выбранных кошек? Это действие необратимо.`)) {
        try {
            await fetch('/api/cats', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ ids: selectedCats })
            });
            await fetchCats();
            handleCancelSelection();
        } catch (error) {
            alert((error as Error).message);
        }
    }
  }, [selectedCats, fetchCats, handleCancelSelection]);

  if (status === 'loading') return <div className="h-screen"><Spinner /></div>;

  return (
    <>
      <AnimatePresence>
        {showWelcomeScreen && session?.user && (
          <LoadingScreen userName={session.user.name ?? 'Гость'} duration={loadingDuration} />
        )}
      </AnimatePresence>
      
      <PatchNotesModal isOpen={showPatchNotes} onClose={handleClosePatchNotes} version={CURRENT_APP_VERSION} />
      {/* --- ИЗМЕНЕНИЕ: Убираем SidePanel --- */}
      {canEdit && <AddCatModal isOpen={isAddCatModalOpen} onClose={() => setIsAddCatModalOpen(false)} onCatAdded={handleCatAdded} />}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <MurdomAiWidget isOpen={isAiAssistantOpen} onClose={() => setIsAiAssistantOpen(false)} />
      <RevaccinationModal isOpen={isAlertsModalOpen} onClose={() => setIsAlertsModalOpen(false)} alerts={vaccinationAlerts} />
      
      {!showWelcomeScreen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen"
        >
          <header className="bg-brand-surface/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-4 py-3">
                {/* --- ИЗМЕНЕНИЕ: Упрощенный header --- */}
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl md:text-2xl font-bold text-brand-primary flex items-center gap-2">
                      <FelineIcon size={28}/>
                      <span className="hidden sm:inline">Архив</span>
                    </h1>
                    <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-lg">
                        <Input 
                            placeholder="Поиск по кличке..."
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
                    </div>
                </div>
            </div>
          </header>
          
          <main className="container mx-auto p-4">
             <RevaccinationAlerts alerts={vaccinationAlerts} onClick={() => setIsAlertsModalOpen(true)} />

            {isDataLoading ? (
               <div className="h-64 flex items-center justify-center"><Spinner /></div>
            ) : (
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                    {filteredCats.length > 0 ? filteredCats.map(cat => (
                        <CatCard 
                            key={cat.id} 
                            cat={cat}
                            isSelected={selectedCats.includes(cat.id)}
                            isSelectionMode={isSelectionMode}
                            onToggleSelection={handleToggleSelection}
                            onStartSelectionMode={handleStartSelectionMode}
                        />
                    )) : (
                        <div className="col-span-full text-center py-16 text-gray-500">
                            <p className="font-semibold text-lg">Кошки не найдены</p>
                            <p>Попробуйте изменить поисковый запрос или добавьте новую кошку.</p>
                        </div>
                    )}
                </motion.div>
            )}
          </main>
          
          <div className="fixed bottom-24 right-6 z-40 flex flex-col gap-4">
                {canUseAiAssistant && (
                    <Button 
                        className="h-16 w-16 rounded-full shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white" 
                        onClick={() => setIsAiAssistantOpen(true)}
                        aria-label="Открыть ИИ-ассистента"
                    >
                        <Sparkles size={32} />
                    </Button>
                )}
                <Button className="h-16 w-16 rounded-full shadow-lg" onClick={() => setIsChatOpen(true)} aria-label="Открыть чат">
                    <MessageCircle size={32} />
                </Button>
          </div>

            <AnimatePresence>
                {isSelectionMode && (
                    <motion.div
                        initial={{ y: "120%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "120%" }}
                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        className="fixed bottom-24 inset-x-4 max-w-md mx-auto z-50"
                    >
                        <div className="bg-brand-surface text-brand-text-primary rounded-xl p-3 shadow-2xl flex items-center justify-between border border-brand-border">
                            <Button onClick={handleCancelSelection} variant="secondary" className="!p-2 !h-10 !w-10 !rounded-full">
                                <X size={24}/>
                            </Button>
                            <span className="font-semibold text-sm">Выбрано: {selectedCats.length}</span>
                            <Button onClick={handleDeleteSelected} variant="danger" className="!rounded-full !h-10 !w-10 sm:!w-auto sm:!px-4">
                                <Trash2 size={24} className="sm:mr-2"/>
                                <span className="hidden sm:inline">Удалить</span>
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}
