// app/components/PatchNotesModal.tsx
"use client";

import React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { Gift, Sparkles } from 'lucide-react';

interface PatchNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    version: string;
}

// Здесь вы будете хранить историю изменений
const patchNotes = [
    {
        version: "1.1.0",
        title: "Большое обновление интерфейса и безопасности!",
        changes: [
            "Приложение теперь можно установить на телефон (PWA).",
            "Добавлен анимированный экран приветствия.",
            "Реализована система ролей и прав доступа.",
            "Добавлена возможность редактировать свой профиль.",
            "Полностью переработан дизайн личного профиля кошки.",
            "Добавлен журнал последних изменений для каждой кошки.",
            "Изображения теперь автоматически оптимизируются при загрузке.",
            "Добавлена функция сканирования документов с камеры.",
            "Реализован экспорт профиля кошки в красивый PDF-документ.",
        ]
    },
    {
        version: "1.1.1",
        title: "Небольшое обновление страниц регистрации/авторизации",
        changes: [
            "Добавлена кнопка глазика для возможности посмотреть свой пароль при логине/регистрации",
            "Изменена логика работы сканера, теперь он будет запрашивать максимально возможное разрешение у камеры телефона"
        ]
    },
    {
        version: "1.1.2",
        title: "Улучшенная система вакцинаций и уведомлений!",
        changes: [
            "Добавлена возможность указывать этапы вакцинации: первая, вторая и ежегодная ревакцинация.",
            "Система теперь автоматически рассчитывает дату следующей прививки: через месяц после первой и через год после второй или ежегодной.",
            "На главной странице и в профиле кошки теперь появляются заметные уведомления о скорых или просроченных прививках.",
            "Добавлено модальное окно со списком всех кошек, требующих вакцинации.",
            "Реализованы Push-уведомления для напоминаний о ревакцинации.",
        ]
    },
    {
        version: "1.1.3",
        title: 'Переименованы категории для вакцинации и пофикшено 2 слова "до"',
        changes: [
            'Первый этап вакцинации переименован в "Первая вакцинация"',
            'Второй этап вакцинации переименован в "Ревакцинация"',
            'Третий этап вакцинации переименован в "Ежегодная вакцинация"',
            'Убраны дублирующиеся слова "до" в просроченных и предстоящих уведомления о вакцинации'
        ]
    },
    // В будущем вы сможете добавлять сюда новые записи
    // {
    //     version: "1.2.0",
    //     title: "Новые возможности!",
    //     changes: ["..."]
    // }
];

const PatchNotesModal: React.FC<PatchNotesModalProps> = ({ isOpen, onClose, version }) => {
    const currentNotes = patchNotes.find(p => p.version === version);

    if (!currentNotes) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="text-center -mt-4">
                <Sparkles className="mx-auto h-16 w-16 text-amber-400" />
                <h2 className="mt-4 text-2xl font-bold text-brand-text-primary">Что нового в версии {currentNotes.version}?</h2>
                <p className="mt-1 text-brand-text-secondary">{currentNotes.title}</p>
            </div>
            
            {/* ИСПРАВЛЕНИЕ: Добавляем overflow-y-auto и max-h-[...], 
              чтобы список становился прокручиваемым, если не помещается на экране.
            */}
            <ul className="mt-6 space-y-2 text-left overflow-y-auto max-h-[50vh] pr-2">
                {currentNotes.changes.map((change, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <Gift size={18} className="text-brand-primary mt-1 flex-shrink-0" />
                        <span className="text-brand-text-primary">{change}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-8">
                <Button onClick={onClose} className="w-full">
                    Понятно, спасибо!
                </Button>
            </div>
        </Modal>
    );
};

export default PatchNotesModal;
