// app/dashboard/CatCard.tsx
"use client";

import { Cat } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CheckCircle2, CalendarDays, PawPrint, ChevronRight } from 'lucide-react';
import useLongPress from '@/hooks/useLongPress';
import { useRouter } from 'next/navigation';

interface CatCardProps {
  cat: Cat;
  isSelected: boolean;
  isSelectionMode: boolean;
  onToggleSelection: (catId: string) => void;
  onStartSelectionMode: (catId: string) => void;
}

const cardVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } }
};

const CatCard: React.FC<CatCardProps> = ({ 
  cat, 
  isSelected, 
  isSelectionMode, 
  onToggleSelection, 
  onStartSelectionMode,
}) => {
  const router = useRouter();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  const onLongPress = () => onStartSelectionMode(cat.id);
  
  const onClick = () => {
    if (isSelectionMode) {
        onToggleSelection(cat.id);
    } else {
        router.push(`/dashboard/cat/${cat.id}`);
    }
  };

  const longPressEvents = useLongPress(onLongPress, onClick, { delay: 500 });

  let avatarSrc: string;
  if (cat.avatarUrl) {
    avatarSrc = cat.avatarUrl.startsWith('data:') ? cat.avatarUrl : `${appUrl}${cat.avatarUrl}`;
  } else {
    avatarSrc = `https://placehold.co/200x200/FFF5F6/FF8E9E?text=${cat.name.charAt(0)}`;
  }

  const getAgeLabel = () => {
     if (!cat.birthYear) return null;
     const age = new Date().getFullYear() - cat.birthYear;
     if (age === 0) return 'Котенок';
     return `${age} ${age === 1 ? 'год' : (age > 1 && age < 5 ? 'года' : 'лет')}`;
  };

  const ageLabel = getAgeLabel();
  const dateLabel = format(new Date(cat.createdAt), 'd MMM yy', { locale: ru });

  return (
    <motion.div
      variants={cardVariants}
      layout
      className={`
        relative group w-full cursor-pointer
        flex items-center gap-4 p-3
        rounded-2xl
        
        /* --- ИЗМЕНЕНИЯ ЗДЕСЬ (КОНТРАСТ) --- */
        /* Делаем фон более плотным белым (было white/60, стало white/80) */
        bg-white/80 
        /* Сильный блюр, чтобы размыть текстуру фона под карточкой */
        backdrop-blur-xl 
        /* Добавляем четкую белую границу */
        border border-white 
        /* Усиливаем тень для "отрыва" от фона */
        shadow-[0_4px_20px_-12px_rgba(0,0,0,0.15)]
        hover:shadow-[0_8px_25px_-10px_rgba(0,0,0,0.2)]
        
        transition-all duration-300
        hover:bg-white
        
        ${isSelected 
            ? 'ring-2 ring-brand-primary bg-brand-primary/10 border-brand-primary/30' 
            : ''
        }
      `}
      {...longPressEvents}
    >
        {/* Аватарка */}
        <div className="relative h-16 w-16 flex-shrink-0">
            {/* Добавил белую обводку и тень для самого фото */}
            <div className="h-full w-full overflow-hidden rounded-xl shadow-sm border-2 border-white">
                <img
                    src={avatarSrc}
                    alt={`Аватар ${cat.name}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />
            </div>
            
            <AnimatePresence>
                {isSelected && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-brand-primary text-white rounded-full p-0.5 shadow-md z-10"
                    >
                        <CheckCircle2 size={16} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Инфо */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-brand-primary transition-colors">
                    {cat.name}
                </h3>
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                {ageLabel && (
                    <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-gray-100 shadow-sm">
                        <PawPrint size={10} className="text-brand-primary/70" />
                        {ageLabel}
                    </span>
                )}
                <span className="flex items-center gap-1 opacity-70">
                    <CalendarDays size={10} />
                    {dateLabel}
                </span>
            </div>
        </div>

        {!isSelectionMode && (
            <div className="mr-2 text-gray-300 group-hover:text-brand-primary/50 group-hover:translate-x-1 transition-all">
                <ChevronRight size={20} />
            </div>
        )}
        
        {isSelectionMode && (
            <div className="absolute inset-0 z-20 rounded-2xl" onClick={() => onToggleSelection(cat.id)} />
        )}
    </motion.div>
  );
};

export default CatCard;