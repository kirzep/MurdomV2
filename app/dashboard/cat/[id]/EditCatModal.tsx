// app/dashboard/cat/[id]/EditCatModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Modal from '@/app/components/ui/Modal';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import { Cat, CatStatus } from '@/types';

interface EditCatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCatUpdated: () => void;
  cat: Cat;
}

const EditCatModal: React.FC<EditCatModalProps> = ({ isOpen, onClose, onCatUpdated, cat }) => {
  const [name, setName] = useState(cat.name);
  const [arrivalDate, setArrivalDate] = useState(cat.arrivalDate ? cat.arrivalDate.split('T')[0] : '');
  const [birthYear, setBirthYear] = useState(cat.birthYear ? cat.birthYear.toString() : '');
  const [status, setStatus] = useState<CatStatus>(cat.status); // === НОВОЕ СОСТОЯНИЕ ===
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cat) {
      setName(cat.name);
      setArrivalDate(cat.arrivalDate ? cat.arrivalDate.split('T')[0] : '');
      setBirthYear(cat.birthYear ? cat.birthYear.toString() : '');
      setStatus(cat.status); // === ОБНОВЛЯЕМ СТАТУС ===
    }
  }, [cat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const updatedData: Partial<Cat> & { newAvatarPath?: string } = {
        name,
        arrivalDate: arrivalDate ? new Date(arrivalDate).toISOString() : null,
        birthYear: birthYear ? parseInt(birthYear) : null,
        status: status, // === ДОБАВЛЯЕМ СТАТУС В ЗАПРОС ===
      };

      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error('Ошибка загрузки аватара');
        updatedData.newAvatarPath = uploadData.filePath;
      }
      
      await fetch(`/api/cats/${cat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      onCatUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Редактировать профиль: ${cat.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-text-secondary mb-1">Имя кошки*</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        
        {/* === НОВЫЙ БЛОК ДЛЯ СТАТУСА === */}
        <div>
          <label className="block text-sm font-medium text-brand-text-secondary mb-1">Статус</label>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value as CatStatus)}
            className="w-full h-12 px-3 py-2 bg-brand-background border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary"
          >
              <option value="В приюте">В приюте</option>
              <option value="Дома">Дома</option>
              <option value="Умерли">На радуге</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-brand-text-secondary mb-1">Год рождения</label>
          <Input type="number" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-text-secondary mb-1">Дата поступления</label>
          <Input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-text-secondary mb-1">Новый аватар (оставьте пустым, чтобы не менять)</label>
          <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-brand-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary-light file:text-brand-primary hover:file:bg-brand-primary-light/80"/>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
          <Button type="submit" isLoading={isLoading}>Сохранить</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCatModal;