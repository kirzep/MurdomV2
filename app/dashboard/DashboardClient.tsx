// app/dashboard/DashboardClient.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Cat, CatStatus, Role } from '@/types';
import CatCard from './CatCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Search, Plus, X, Trash2, Cat as CatIcon } from 'lucide-react';
import AddCatModal from './AddCatModal';
import { AnimatePresence, motion } from 'framer-motion';
import { useDebounce } from 'use-debounce';
import LoadingScreen from '../components/LoadingScreen';
import PatchNotesModal from '../components/PatchNotesModal';
import RevaccinationAlerts from './RevaccinationAlerts';
import { getRevaccinationStatus, RevaccinationInfo } from '@/lib/revaccinationHelper';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const CURRENT_APP_VERSION = '2.3.0';

// Конфигурация вкладок фильтра
const FILTER_TABS: { id: CatStatus; label: string; icon: string }[] = [
    { id: 'В приюте', label: 'В приюте', icon: '/assets/icons/archive_sections/archive.png' },
    { id: 'Дома', label: 'Дома', icon: '/assets/icons/archive_sections/home.png' },
    { id: 'Умерли', label: 'На радуге', icon: '/assets/icons/archive_sections/dead.png' },
];

export default function DashboardClient({ loadingIcons }: { loadingIcons: string[] }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [cats, setCats] = useState<Cat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 400);
  
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  
  const [activeFilter, setActiveFilter] = useState<CatStatus>('В приюте');
  
  const canEdit = session?.user.role !== Role.VOLUNTEER;

  const filteredCats = useMemo(() => {
    const sorted = [...cats].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const searched = !debouncedSearchQuery 
        ? sorted 
        : sorted.filter(cat => cat.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
    return searched.filter(cat => cat.status === activeFilter);
  }, [cats, debouncedSearchQuery, activeFilter]);

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
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen"
      >
        {/* --- ОБНОВЛЕННЫЙ ХЕДЕР --- */}
        <header className="bg-brand-surface/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm border-b border-white/20 transition-all duration-300">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center gap-3">
                    
                    {/* Поле поиска - теперь занимает всё доступное место */}
                    <div className="flex-1 relative group">
                        {/* Декоративное свечение при фокусе */}
                        <div className="absolute inset-0 bg-brand-primary/5 rounded-2xl blur-md transition-opacity opacity-0 group-focus-within:opacity-100 pointer-events-none" />
                        
                        <Input 
                            placeholder="Найти хвостика..."
                            icon={<Search size={20} className="text-brand-primary/50 group-focus-within:text-brand-primary transition-colors"/>}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-12 rounded-2xl bg-white/60 border-transparent shadow-sm hover:bg-white focus:bg-white focus:shadow-md transition-all text-base pl-11"
                        />
                    </div>

                    {/* Кнопка добавления - яркая и красивая */}
                    <div className="flex items-center shrink-0">
                        {canEdit && (
                          <Button 
                              onClick={() => setIsAddCatModalOpen(true)} 
                              className="
                                  !p-0 h-12 w-12 sm:w-auto sm:px-5 rounded-2xl 
                                  bg-gradient-to-tr from-brand-primary to-rose-400 
                                  hover:from-brand-primary-hover hover:to-rose-500
                                  shadow-lg shadow-brand-primary/25 
                                  hover:shadow-xl hover:shadow-brand-primary/40 hover:-translate-y-0.5
                                  active:scale-95
                                  transition-all duration-300
                                  flex items-center justify-center gap-2
                              "
                          >
                              <Plus size={26} strokeWidth={2.5} className="text-white" /> 
                              <span className="hidden sm:inline font-bold text-white">Создать</span>
                          </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
          
        <main className="container mx-auto p-4 pb-32">
            
            {/* Вкладки фильтра */}
            <div className="flex justify-center mb-8">
                <div className="flex p-1.5 bg-white/60 backdrop-blur-xl border border-white/60 rounded-[1.5rem] shadow-sm relative z-10">
                    {FILTER_TABS.map((tab) => {
                        const isActive = activeFilter === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveFilter(tab.id)}
                                className={`
                                    relative px-4 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2
                                    ${isActive ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-700'}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeFilterTab"
                                        className="absolute inset-0 bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] rounded-2xl border border-white/50"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <img 
                                        src={tab.icon} 
                                        alt="" 
                                        className={`w-5 h-5 transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : 'grayscale opacity-60'}`} 
                                    />
                                    <span>{tab.label}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
           
           {activeFilter === 'В приюте' && (
               <div className="max-w-4xl mx-auto">
                   <RevaccinationAlerts alerts={vaccinationAlerts} />
               </div>
           )}
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={activeFilter}
            >
                <AnimatePresence mode="popLayout">
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
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                            className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400"
                        >
                            <div className="w-24 h-24 bg-gray-100/50 rounded-full flex items-center justify-center mb-4">
                                <CatIcon size={48} className="opacity-20" />
                            </div>
                            <p className="font-bold text-lg">Список пуст</p>
                            <p className="text-sm opacity-70">В этой категории пока никого нет.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </main>
          
        <AnimatePresence>
            {isSelectionMode && (
                <motion.div
                    initial={{ y: "120%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "120%" }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    className="fixed bottom-24 inset-x-4 max-w-md mx-auto z-50"
                >
                    <div className="bg-white/90 backdrop-blur-xl text-gray-800 rounded-2xl p-3 shadow-2xl flex items-center justify-between border border-white/50 ring-1 ring-black/5">
                        <Button onClick={handleCancelSelection} variant="secondary" className="!p-2 !h-10 !w-10 !rounded-full">
                            <X size={24}/>
                        </Button>
                        <span className="font-bold text-sm">Выбрано: {selectedCats.length}</span>
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