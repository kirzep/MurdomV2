// app/dashboard/CatCard.tsx
"use client";

import { Cat } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CheckCircle2 } from 'lucide-react';
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
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

const CatCard: React.FC<CatCardProps> = ({ cat, isSelected, isSelectionMode, onToggleSelection, onStartSelectionMode }) => {
  const router = useRouter();

  const onLongPress = () => {
    onStartSelectionMode(cat.id);
  };
  
  const onClick = () => {
    if (isSelectionMode) {
      onToggleSelection(cat.id);
    } else {
      router.push(`/dashboard/cat/${cat.id}`);
    }
  };

  const longPressEvents = useLongPress(onLongPress, onClick, { delay: 500 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  let avatarSrc: string;
  if (cat.avatarUrl) {
    if (cat.avatarUrl.startsWith('data:')) {
      avatarSrc = cat.avatarUrl;
    } else {
      avatarSrc = `${appUrl}${cat.avatarUrl}`;
    }
  } else {
    avatarSrc = `https://placehold.co/80x80/e2e8f0/64748b?text=${cat.name.charAt(0)}`;
  }

  return (
    <motion.div
      variants={cardVariants}
      layout
      // ИЗМЕНЕНИЕ: Новый стиль рамки при выборе
      className={`relative group bg-brand-surface rounded-xl shadow-md overflow-hidden cursor-pointer border-2 ${isSelected ? 'border-brand-primary' : 'border-transparent'}`}
      {...longPressEvents}
      transition={{ duration: 0.2 }}
    >
        <div className={`transition-opacity duration-200 ${isSelectionMode ? 'opacity-60' : 'opacity-100'}`}>
            <div className="flex items-center p-4">
              <img
                src={avatarSrc}
                alt={`Аватар ${cat.name}`}
                className="w-20 h-20 object-cover rounded-full mr-4 border-2 border-brand-primary-light"
              />
              <div className="min-w-0">
                  <h3 className="text-xl font-bold text-brand-text-primary truncate">{cat.name}</h3>
                <p className="text-sm text-brand-text-secondary">
                  В архиве с: {format(new Date(cat.createdAt), 'd MMM yy', { locale: ru })} г.
                </p>
              </div>
            </div>
        </div>
        {/* ИЗМЕНЕНИЕ: Новый вид галочки в углу */}
        <AnimatePresence>
            {isSelectionMode && (
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
                >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-brand-primary' : 'bg-white/80 border-2 border-gray-300'}`}>
                        {isSelected && <CheckCircle2 size={20} className="text-white"/>}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
  );
};

export default CatCard;