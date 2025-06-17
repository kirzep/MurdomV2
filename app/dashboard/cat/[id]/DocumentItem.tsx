// app/dashboard/cat/[id]/DocumentItem.tsx
"use client";

import { Document as DocType } from "@/types";
import useLongPress from "@/hooks/useLongPress";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle2 } from "lucide-react";

interface DocumentItemProps {
  doc: DocType;
  isSelected: boolean;
  isSelectionMode: boolean;
  onToggleSelection: (docId: string) => void;
  onStartSelection: (docId: string) => void;
  onOpenDocument: (doc: DocType) => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ doc, isSelected, isSelectionMode, onToggleSelection, onStartSelection, onOpenDocument }) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  const longPressEvents = useLongPress(
    () => onStartSelection(doc.id),
    () => (isSelectionMode ? onToggleSelection(doc.id) : onOpenDocument(doc)),
    { delay: 500 }
  );

  return (
    // ИЗМЕНЕНИЕ: Добавлены классы relative и overflow-hidden
    <div
      className={`relative aspect-square bg-brand-background rounded-lg group cursor-pointer border-2 overflow-hidden ${isSelected ? 'border-brand-primary' : 'border-transparent'}`}
      {...longPressEvents}
    >
      <div className={`transition-opacity duration-200 ${isSelectionMode ? 'opacity-60' : 'opacity-100'}`}>
        {doc.fileType.startsWith('image/') ? (
          // ИЗМЕНЕНИЕ: Картинка теперь абсолютно спозиционирована, чтобы не влиять на размеры ячейки
          <img src={`${appUrl}${doc.filePath}`} alt={doc.fileName} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-brand-text-secondary">
            <FileText size={40} />
            <span className="text-xs mt-2 text-center truncate w-full">{doc.fileName}</span>
          </div>
        )}
      </div>
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            // ИЗМЕНЕНИЕ: Оверлей выбора также абсолютно спозиционирован
            className="absolute inset-0 bg-sky-500/20 flex items-center justify-center"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-brand-primary' : 'bg-white/80 border-2 border-gray-300'}`}>
              {isSelected && <CheckCircle2 size={20} className="text-white" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentItem;