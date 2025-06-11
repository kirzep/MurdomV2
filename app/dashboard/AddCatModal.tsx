// app/dashboard/AddCatModal.tsx
"use client";

import React, { useState } from 'react';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Cat } from '@/types';
import { generateAvatar } from '@/lib/utils';

interface AddCatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCatAdded: (newCat: Cat) => void;
}

const AddCatModal: React.FC<AddCatModalProps> = ({ isOpen, onClose, onCatAdded }) => {
  const [name, setName] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setArrivalDate('');
    setBirthYear('');
    setAvatarFile(null);
    setError('');
    setIsLoading(false);
  }

  const handleClose = () => {
    resetForm();
    onClose();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Имя не может быть пустым.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      let avatarUrl = null;
      // Шаг 1: Если выбран файл, загружаем его
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error('Ошибка загрузки аватара');
        avatarUrl = uploadData.filePath; // Получаем путь к загруженному файлу
      } else {
        avatarUrl = generateAvatar(name); // Генерируем, если нет файла
      }

      // Шаг 2: Создаем запись о кошке
      const catData = {
        name,
        avatarUrl,
        arrivalDate: arrivalDate ? new Date(arrivalDate).toISOString() : null,
        birthYear: birthYear ? parseInt(birthYear) : null,
      };

      const response = await fetch('/api/cats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData),
      });

      if (!response.ok) {
        throw new Error('Не удалось добавить кошку');
      }

      const newCat = await response.json();
      onCatAdded(newCat);
      handleClose(); // Закрываем и сбрасываем форму
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Добавить новую кошку">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-text-secondary mb-1">Имя кошки*</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Мурка" required />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-brand-text-secondary mb-1">Год рождения (опционально)</label>
          <Input type="number" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} placeholder={`Например, ${new Date().getFullYear() - 2}`} />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-brand-text-secondary mb-1">Дата поступления (опционально)</label>
          <Input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-brand-text-secondary mb-1">Аватар (опционально)</label>
          <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-brand-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary-light file:text-brand-primary hover:file:bg-brand-primary-light/80"/>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>Отмена</Button>
          <Button type="submit" isLoading={isLoading}>Добавить</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCatModal;
