// app/dashboard/cat/[id]/NotesSection.tsx
"use client";

import { Cat } from "@/types";
import { useState, useEffect } from "react";
import { Save, NotebookPen, StickyNote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface NotesSectionProps {
  cat: Cat;
  onUpdate: (data: Partial<Cat>) => Promise<void>;
  canEdit: boolean;
}

const NotesSection: React.FC<NotesSectionProps> = ({ cat, onUpdate, canEdit }) => {
  const [notes, setNotes] = useState(cat.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const isModified = notes !== (cat.notes || '');

  useEffect(() => {
    setNotes(cat.notes || '');
  }, [cat.notes]);

  const handleSave = async () => {
    if (!isModified) return;
    setIsSaving(true);
    await onUpdate({ notes });
    setIsSaving(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white shadow-lg p-6 rounded-3xl flex flex-col">
      <div className="flex justify-between items-center mb-4 h-10">
        <div className="flex items-center gap-3 text-gray-800">
             <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                <NotebookPen size={24} />
             </div>
            <h3 className="text-xl font-bold">Заметки</h3>
        </div>

        <AnimatePresence>
            {canEdit && isModified && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: 20 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="
                        flex items-center gap-2 px-4 py-2 rounded-xl
                        bg-brand-primary text-white font-bold text-sm shadow-md shadow-brand-primary/20
                        hover:bg-brand-primary-dark hover:-translate-y-0.5 transition-all
                        disabled:opacity-70 disabled:cursor-not-allowed
                    "
                >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    <span>Сохранить</span>
                </motion.button>
            )}
        </AnimatePresence>
      </div>

      <div className="relative group w-full">
        <div className={`
            absolute inset-0 bg-gray-50 border border-gray-200 rounded-2xl transition-colors duration-300 pointer-events-none
            ${canEdit ? 'group-focus-within:bg-white group-focus-within:border-brand-primary/50 group-focus-within:ring-4 group-focus-within:ring-brand-primary/10' : ''}
        `} />

        {(!canEdit && !notes) ? (
            <div className="relative min-h-[120px] flex flex-col items-center justify-center text-gray-400 z-10">
                <StickyNote size={32} className="opacity-20 mb-2" />
                <p className="text-sm font-medium opacity-60">Заметок нет</p>
            </div>
        ) : (
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={canEdit ? "Характер, привычки, важные особенности..." : ""}
                // Изменил min-h-[200px] на min-h-[120px] и убрал h-full
                className="
                    relative z-10 w-full min-h-[120px] p-5
                    bg-transparent border-none outline-none resize-y
                    text-gray-700 font-medium leading-relaxed
                    placeholder:text-gray-400/70
                    custom-scrollbar
                "
                readOnly={!canEdit}
            />
        )}
        
        {canEdit && (
            <div className="absolute bottom-4 right-4 text-gray-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <NotebookPen size={16} />
            </div>
        )}
      </div>
    </div>
  );
};

export default NotesSection;