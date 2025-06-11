// app/dashboard/cat/[id]/NotesSection.tsx
"use client";

import { Cat } from "@/types";
import { useState, useEffect } from "react";
import { useDebounce } from 'use-debounce';

interface NotesSectionProps {
  cat: Cat;
  onUpdate: (data: Partial<Cat>) => Promise<void>;
  canEdit: boolean;
}

const NotesSection: React.FC<NotesSectionProps> = ({ cat, onUpdate, canEdit }) => {
  const [notes, setNotes] = useState(cat.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [debouncedNotes] = useDebounce(notes, 1000);

  useEffect(() => {
    // Автосохранение работает только если есть права
    if (!canEdit) return;

    const saveNotes = async () => {
      // Условие изменено, чтобы корректно сравнивать null и пустую строку
      if (debouncedNotes !== (cat.notes || '')) {
        setIsSaving(true);
        await onUpdate({ notes: debouncedNotes });
        setIsSaving(false);
      }
    };
    saveNotes();
  }, [debouncedNotes, cat.notes, onUpdate, canEdit]);
  
  // Синхронизируем состояние, если пропсы изменились (например, после отмены редактирования)
  useEffect(() => {
    setNotes(cat.notes || '');
  }, [cat.notes]);

  return (
    <div className="bg-brand-surface/80 backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-brand-text-primary">Заметки</h3>
        {isSaving && canEdit && <div className="text-sm text-brand-text-secondary flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary"></div>
          Сохранение...
        </div>}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={canEdit ? "Сюда можно записывать любую важную информацию..." : "Заметок нет."}
        className="w-full h-40 p-3 bg-brand-background border-brand-border border rounded-lg resize-y focus:ring-2 focus:ring-brand-primary outline-none transition-shadow disabled:bg-slate-100 disabled:cursor-not-allowed"
        readOnly={!canEdit}
        disabled={!canEdit}
      />
    </div>
  );
};

export default NotesSection;
