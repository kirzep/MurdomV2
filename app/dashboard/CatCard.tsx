// app/dashboard/CatCard.tsx
"use client";

import { Cat } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CheckCircle2 } from 'lucide-react';
import useLongPress from '@/hooks/useLongPress';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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

const availablePositions = [
  { top: '15%', left: '70%', transform: 'rotate(15deg) scale(0.8)' },
  { top: '65%', left: '80%', transform: 'rotate(-20deg) scale(0.7)' },
  { top: '60%', left: '10%', transform: 'rotate(5deg) scale(0.9)' },
  { top: '8%', left: '15%', transform: 'rotate(-10deg) scale(0.6)' },
  { top: '35%', left: '40%', transform: 'rotate(25deg) scale(0.75)' },
  { top: '80%', left: '45%', transform: 'rotate(-5deg) scale(0.85)' },
];

const CatCard: React.FC<CatCardProps> = ({ 
  cat, 
  isSelected, 
  isSelectionMode, 
  onToggleSelection, 
  onStartSelectionMode,
}) => {
  // --- НАСТРОЙКА ПРОЗРАЧНОСТИ ---
  // Меняйте это значение от 0.0 (полностью прозрачный) до 1.0 (полностью видимый)
  const ICON_OPACITY = 0.2; 
  // --- КОНЕЦ НАСТРОЙКИ ---

  const router = useRouter();
  const [backgroundIcons, setBackgroundIcons] = useState<{ id: string; src: string; style: object; }[]>([]);

  useEffect(() => {
    const fetchAndSetIcons = async () => {
      try {
        const res = await fetch('/api/icons/dashboard_catcard_background_icons');
        if (res.ok) {
          const iconPaths = await res.json();
          if (Array.isArray(iconPaths) && iconPaths.length > 0) {
            const shuffledIcons = [...iconPaths].sort(() => 0.5 - Math.random());
            const shuffledPositions = [...availablePositions].sort(() => 0.5 - Math.random());
            const numIcons = Math.floor(Math.random() * 2) + 2; 

            const newIcons = shuffledIcons.slice(0, numIcons).map((src, index) => ({
              id: `${cat.id}-bg-${index}`,
              src: src,
              style: {
                ...shuffledPositions[index],
                transition: 'transform 0.3s ease, opacity 0.3s ease',
              }
            }));
            setBackgroundIcons(newIcons);
          }
        }
      } catch (error) {
        console.error("Не удалось загрузить иконки для карточки:", error);
      }
    };
    
    fetchAndSetIcons();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat.id]);

  const onLongPress = () => onStartSelectionMode(cat.id);
  const onClick = () => isSelectionMode ? onToggleSelection(cat.id) : router.push(`/dashboard/cat/${cat.id}`);
  const longPressEvents = useLongPress(onLongPress, onClick, { delay: 500 });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  let avatarSrc: string;
  if (cat.avatarUrl) {
    avatarSrc = cat.avatarUrl.startsWith('data:') ? cat.avatarUrl : `${appUrl}${cat.avatarUrl}`;
  } else {
    avatarSrc = `https://placehold.co/80x80/e2e8f0/64748b?text=${cat.name.charAt(0)}`;
  }

  return (
    <motion.div
      variants={cardVariants}
      layout
      className={`relative group bg-brand-surface rounded-xl shadow-md overflow-hidden cursor-pointer border-2 ${isSelected ? 'border-brand-primary' : 'border-transparent'}`}
      {...longPressEvents}
      transition={{ duration: 0.2 }}
    >
        <div className="absolute inset-0 z-0">
            {backgroundIcons.map(icon => (
                <div 
                  key={icon.id} 
                  className="absolute group-hover:scale-110 transition-all duration-300" 
                  // Теперь прозрачность задается через инлайн-стиль
                  style={{
                    ...icon.style,
                    opacity: isSelectionMode ? 0 : ICON_OPACITY,
                  }}
                >
                    <img src={icon.src} alt="" className="w-16 h-16"/>
                </div>
            ))}
        </div>

        <div className={`relative z-10 transition-opacity duration-200 ${isSelectionMode ? 'opacity-60' : 'opacity-100'}`}>
            <div className="flex items-center p-4">
              <img
                src={avatarSrc}
                alt={`Аватар ${cat.name}`}
                className="w-20 h-20 object-cover rounded-full mr-4 border-2 border-brand-primary-light flex-shrink-0"
              />
              <div className="min-w-0">
                  <h3 className="text-xl font-bold text-brand-text-primary truncate">{cat.name}</h3>
                <p className="text-sm text-brand-text-secondary">
                  В архиве с: {format(new Date(cat.createdAt), 'd MMM yy', { locale: ru })} г.
                </p>
              </div>
            </div>
        </div>
        
        <AnimatePresence>
            {isSelectionMode && (
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 z-20"
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