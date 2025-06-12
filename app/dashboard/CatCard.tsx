// app/dashboard/CatCard.tsx
"use client";

import { useState } from 'react';
import { Cat } from '@/types';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Info } from 'lucide-react';
import CreatorInfoModal from './CreatorInfoModal';

interface CatCardProps {
  cat: Cat;
}

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

const CatCard: React.FC<CatCardProps> = ({ cat }) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInfoModalOpen(true);
  };

  // Формируем абсолютный URL для аватара
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const avatarSrc = cat.avatarUrl 
    ? `${appUrl}${cat.avatarUrl}` 
    : `https://placehold.co/80x80/e2e8f0/64748b?text=${cat.name.charAt(0)}`;

  return (
    <>
      <CreatorInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        creator={cat.creator}
        catName={cat.name}
        catAddedDate={cat.createdAt}
      />
      <motion.div
        variants={cardVariants}
        layout
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="relative group bg-brand-surface rounded-xl shadow-md overflow-hidden"
      >
        <Link href={`/dashboard/cat/${cat.id}`} className="block cursor-pointer">
            <div className="flex items-center p-4">
              <img
                src={avatarSrc}
                alt={`Аватар ${cat.name}`}
                className="w-20 h-20 object-cover rounded-full mr-4 border-2 border-brand-primary-light"
              />
              <div>
                <h3 className="text-xl font-bold text-brand-text-primary">{cat.name}</h3>
                <p className="text-sm text-brand-text-secondary">
                  В архиве с: {format(new Date(cat.createdAt), 'd MMM yy', { locale: ru })} г.
                </p>
              </div>
            </div>
        </Link>
        <button
          onClick={handleInfoClick}
          className="absolute top-2 right-2 p-2 bg-white/70 backdrop-blur-sm rounded-full text-brand-text-secondary hover:text-brand-primary opacity-0 sm:opacity-100 sm:group-hover:opacity-100 focus:opacity-100 transition-opacity"
          title="Информация о записи"
        >
          <Info size={22} />
        </button>
      </motion.div>
    </>
  );
};

export default CatCard;
