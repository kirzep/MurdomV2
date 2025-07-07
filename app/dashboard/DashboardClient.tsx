// app/dashboard/DashboardClient.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Cat, CatStatus, Role } from '@/types';
import CatCard from './CatCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Search, Plus, X, Trash2, ArchiveRestore } from 'lucide-react';
import AddCatModal from './AddCatModal';
import { AnimatePresence, motion } from 'framer-motion';
import { useDebounce } from 'use-debounce';
import ChatWidget from '../components/ChatWidget';
import LoadingScreen from '../components/LoadingScreen';
import PatchNotesModal from '../components/PatchNotesModal';
import RevaccinationAlerts from './RevaccinationAlerts';
import RevaccinationModal from './RevaccinationModal';
import { getRevaccinationStatus, RevaccinationInfo } from '@/lib/revaccinationHelper';
import MurdomAiWidget from '../components/AiAssistantWidget';
import FloatingActionMenu from '../components/FloatingActionMenu';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const CURRENT_APP_VERSION = '2.2.1'; // Версия до введения встряхивания

export default function DashboardClient({ loadingIcons }: { loadingIcons: string[] }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [cats, setCats] = useState<Cat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 400);
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  
  const [activeFilter, setActiveFilter] = useState<CatStatus>('В приюте');
  const [pageTitle, setPageTitle] = useState('В приюте');
  
  const canEdit = session?.user.role !== Role.VOLUNTEER;
  const canUseAiAssistant = session?.user.role === Role.MEDICAL_STAFF || session?.user.role === Role.TRUSTED_PERSON || session?.user.role === Role.DEVELOPER;
    
  useEffect(() => {
    setPageTitle(activeFilter === 'В приюте' ? 'В приюте' : 'Архив: Дома');
  }, [activeFilter]);

  const { inShelterCats, atHomeCats } = useMemo(() => {
    const sortedCats = [...cats].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const filteredByName = !debouncedSearchQuery 
        ? sortedCats 
        : sortedCats.filter(cat => cat.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));

    return {
      inShelterCats: filteredByName.filter(cat => cat.status === 'В приюте'),
      atHomeCats: filteredByName.filter(cat => cat.status === 'Дома'),
    };
  }, [cats, debouncedSearchQuery]);

  const currentCats = activeFilter === 'В приюте' ? inShelterCats : atHomeCats;

  const vaccinationAlerts = useMemo(() => {
    return cats
      .map(cat => {
        const alert = getRevaccinationStatus(cat);
        return alert.status ? { cat, alert } : null;
      })
      .filter((item): item is { cat: Cat; alert: RevaccinationInfo } => item !== null);
  }, [cats]);

  const fetchCats = useCallback(async () => {
    try {
      const res = await fetch(`/api/cats`);
      const data = await res.json();
      setCats(data);
    } catch (error) {
      console.error('Ошибка при загрузке кошек:', error);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchCats();
      const lastSeenVersion = typeof window !== 'undefined' ? localStorage.getItem('appVersion') : null;
      if (lastSeenVersion !== CURRENT_APP_VERSION) {
          setShowPatchNotes(true);
      }
    }
  }, [status, router, fetchCats]);

  const handleClosePatchNotes = () => {
    setShowPatchNotes(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('appVersion', CURRENT_APP_VERSION);
    }
  };

  const handleCatAdded = (newCat: Cat) => {
    setCats(prevCats => [newCat, ...prevCats]);
  };

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

  if (status === 'loading' || isDataLoading) {
    return <LoadingScreen userName={session?.user?.name ?? 'Гость'} iconPaths={loadingIcons} />;
  }

  return (
    <>
      <PatchNotesModal isOpen={showPatchNotes} onClose={handleClosePatchNotes} version={CURRENT_APP_VERSION} />
      {canEdit && <AddCatModal isOpen={isAddCatModalOpen} onClose={() => setIsAddCatModalOpen(false)} onCatAdded={handleCatAdded} />}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <MurdomAiWidget isOpen={isAiAssistantOpen} onClose={() => setIsAiAssistantOpen(false)} />
      <RevaccinationModal isOpen={isAlertsModalOpen} onClose={() => setIsAlertsModalOpen(false)} alerts={vaccinationAlerts} />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen"
      >
        <header className="bg-brand-surface/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl md:text-2xl font-bold text-brand-primary flex items-center gap-2">
                      <img src="/icons/android-chrome-512x512.png" alt="Логотип" className="h-7 w-7" />
                      <span className="hidden sm:inline">{pageTitle}</span>
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
           {activeFilter === 'В приюте' && <RevaccinationAlerts alerts={vaccinationAlerts} onClick={() => setIsAlertsModalOpen(true)} />}

           {activeFilter === 'Дома' && (
                 <div className="mb-4">
                    <Button onClick={() => setActiveFilter('В приюте')} variant='secondary'>
                        <ArchiveRestore size={16} className="mr-2"/> Вернуться в основной архив
                    </Button>
                 </div>
            )}
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
                {currentCats.length > 0 ? currentCats.map(cat => (
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
                        <p>В категории "{activeFilter}" нет кошек, соответствующих вашему запросу.</p>
                    </div>
                )}
            </motion.div>
        </main>
          
        <FloatingActionMenu
          onChatClick={() => setIsChatOpen(true)}
          onAiClick={() => setIsAiAssistantOpen(true)}
          canUseAi={canUseAiAssistant}
          onHomeArchiveClick={() => setActiveFilter('Дома')}
        />

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
    </>
  );
}