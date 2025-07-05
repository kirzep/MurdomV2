// app/dashboard/RevaccinationModal.tsx
"use client";

import Modal from '../components/ui/Modal';
import { Cat } from '@/types';
import { RevaccinationInfo } from '@/lib/revaccinationHelper';
import Link from 'next/link';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface RevaccinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Array<{ cat: Cat, alert: RevaccinationInfo }>;
}

const RevaccinationModal: React.FC<RevaccinationModalProps> = ({ isOpen, onClose, alerts }) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Уведомления о вакцинациях">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {alerts.length > 0 ? (
            alerts.sort((a,b) => a.alert.dueDate!.getTime() - b.alert.dueDate!.getTime()).map(({ cat, alert }) => {
                let avatarSrc: string;
                if (cat.avatarUrl) {
                    avatarSrc = cat.avatarUrl.startsWith('data:') ? cat.avatarUrl : `${appUrl}${cat.avatarUrl}`;
                } else {
                    avatarSrc = `https://placehold.co/40x40/e2e8f0/64748b?text=${cat.name.charAt(0)}`;
                }
                
                const isOverdue = alert.status === 'overdue';
                const bannerClasses = isOverdue ? "bg-brand-accent-bg border-brand-accent text-brand-accent-text" : "bg-brand-warning-bg border-brand-warning text-brand-warning-text";

                return (
                    <div key={cat.id} className={`p-4 border-l-4 rounded-r-lg shadow-sm ${bannerClasses}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={avatarSrc} alt={cat.name} className="w-10 h-10 rounded-full border-2 border-white/50"/>
                                <div>
                                    <p className="font-bold">{cat.name}</p>
                                    <p className="text-sm font-medium">{alert.message}</p>
                                </div>
                            </div>
                            <Link href={`/dashboard/cat/${cat.id}`} className="p-2 rounded-full hover:bg-black/10 transition-colors">
                                <ArrowRight size={20}/>
                            </Link>
                        </div>
                        <div className="mt-2 pl-12 text-sm flex items-center gap-2 font-semibold">
                           <AlertTriangle size={16} />
                           <span>
                                {isOverdue ? "Просрочено" : "Срок до"}: {format(alert.dueDate!, 'd MMMM yy', { locale: ru })}
                           </span>
                        </div>
                    </div>
                )
            })
        ) : (
            <p className="text-center text-gray-500 py-8">Нет предстоящих или просроченных вакцинаций.</p>
        )}
      </div>
    </Modal>
  );
};

export default RevaccinationModal;