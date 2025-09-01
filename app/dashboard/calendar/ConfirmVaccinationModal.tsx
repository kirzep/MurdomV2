// app/dashboard/calendar/ConfirmVaccinationModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Modal from '@/app/components/ui/Modal';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import { CalendarEvent } from '@/lib/calendarHelper';
import { Treatment, TreatmentType } from '@/types';
import { Syringe } from 'lucide-react';

interface ConfirmVaccinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productName: string) => void;
  event: CalendarEvent | null;
  catTreatments: Treatment[];
  isLoading: boolean;
}

const ConfirmVaccinationModal: React.FC<ConfirmVaccinationModalProps> = ({ isOpen, onClose, onConfirm, event, catTreatments, isLoading }) => {
  const [productName, setProductName] = useState('');

  useEffect(() => {
    if (event) {
      // Ищем последнюю вакцинацию, чтобы подставить название препарата
      const lastVaccination = catTreatments
        .filter(t => t.type === TreatmentType.VACCINATION)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      setProductName(lastVaccination?.productName || '');
    }
  }, [event, catTreatments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productName.trim()) {
      onConfirm(productName.trim());
    }
  };

  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Вакцинация: ${event.catName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center">
            <Syringe size={48} className="mx-auto text-brand-primary mb-2" />
            <p className="text-brand-text-secondary">
                Вы собираетесь отметить как выполненную прививку: <strong className="text-brand-text-primary">{event.stageText}</strong>.
            </p>
        </div>
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-brand-text-secondary mb-1">
            Название препарата/вакцины*
          </label>
          <Input
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Например, Nobivac Tricat Trio"
            required
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Подтвердить
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ConfirmVaccinationModal;