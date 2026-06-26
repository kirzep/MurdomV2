// app/dashboard/cat/[id]/CatTimeline.tsx
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Cat, TreatmentType } from '@/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
    History, MapPin, Pill, Bug, Ear, Syringe, FileText, Image as ImageIcon, Clock,
} from 'lucide-react';

interface TimelineEvent {
    id: string;
    date: Date;
    title: string;
    sub: string;
    badge?: string | null;
    Icon: React.ElementType;
    cls: string; // bg + text + border
}

const treatmentVisual: Record<TreatmentType, { name: string; Icon: React.ElementType; cls: string }> = {
    [TreatmentType.WORMS]: { name: 'Дегельминтизация', Icon: Pill, cls: 'bg-rose-50 text-rose-500 border-rose-100' },
    [TreatmentType.FLEAS]: { name: 'Обработка от блох', Icon: Bug, cls: 'bg-amber-50 text-amber-600 border-amber-100' },
    [TreatmentType.EAR_MITES]: { name: 'Ушной клещ', Icon: Ear, cls: 'bg-sky-50 text-sky-600 border-sky-100' },
    [TreatmentType.VACCINATION]: { name: 'Вакцинация', Icon: Syringe, cls: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
};

const vaccineBadge = (stage?: string | null) => {
    if (stage === 'first') return '1 этап';
    if (stage === 'second') return '2 этап';
    if (stage === 'revaccination') return 'Ежегодно';
    return null;
};

const CatTimeline: React.FC<{ cat: Cat }> = ({ cat }) => {
    const [photoDates, setPhotoDates] = useState<string[]>([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/cats/${cat.id}/photos`);
                const data: { createdAt?: string }[] = await res.json();
                if (!cancelled && Array.isArray(data)) {
                    setPhotoDates(data.map((p) => p.createdAt).filter(Boolean) as string[]);
                }
            } catch {
                /* фото опциональны для ленты */
            }
        })();
        return () => { cancelled = true; };
    }, [cat.id]);

    const events = useMemo<TimelineEvent[]>(() => {
        const list: TimelineEvent[] = [];

        (cat.treatments || []).forEach((t) => {
            const v = treatmentVisual[t.type];
            list.push({
                id: `t-${t.id}`,
                date: new Date(t.date),
                title: t.productName,
                sub: v.name,
                badge: t.type === TreatmentType.VACCINATION ? vaccineBadge(t.vaccinationStage) : null,
                Icon: v.Icon,
                cls: v.cls,
            });
        });

        (cat.documents || []).forEach((d) => {
            list.push({
                id: `d-${d.id}`,
                date: new Date(d.createdAt),
                title: d.fileName,
                sub: 'Документ добавлен',
                Icon: FileText,
                cls: 'bg-blue-50 text-blue-600 border-blue-100',
            });
        });

        // Фото — группируем по дню
        const byDay = new Map<string, { date: Date; count: number }>();
        photoDates.forEach((iso) => {
            const d = new Date(iso);
            const key = format(d, 'yyyy-MM-dd');
            const existing = byDay.get(key);
            if (existing) existing.count += 1;
            else byDay.set(key, { date: d, count: 1 });
        });
        byDay.forEach(({ date, count }, key) => {
            list.push({
                id: `p-${key}`,
                date,
                title: `Добавлено ${count} ${count === 1 ? 'фото' : 'фото'}`,
                sub: 'в галерею',
                Icon: ImageIcon,
                cls: 'bg-purple-50 text-purple-600 border-purple-100',
            });
        });

        if (cat.arrivalDate) {
            list.push({
                id: 'arrival',
                date: new Date(cat.arrivalDate),
                title: 'Прибытие в приют',
                sub: 'начало истории',
                Icon: MapPin,
                cls: 'bg-brand-primary-light text-brand-primary border-rose-100',
            });
        }

        // Новые сверху
        return list.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [cat.treatments, cat.documents, cat.arrivalDate, photoDates]);

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-lg p-6 sm:p-8 rounded-3xl">
            <div className="flex items-center gap-3 text-gray-800 mb-6">
                <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl">
                    <History size={24} />
                </div>
                <h3 className="text-xl font-bold">Хроника</h3>
                <span className="text-sm text-gray-400 font-medium ml-auto">{events.length} событий</span>
            </div>

            {events.length > 0 ? (
                <div className="relative">
                    {/* Вертикальная линия */}
                    <div className="absolute left-[19px] top-3 bottom-8 w-0.5 bg-gray-100 z-0" />

                    <div className="space-y-4 relative z-10">
                        {events.map((e, index) => {
                            const Icon = e.Icon;
                            return (
                                <motion.div
                                    key={e.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-40px' }}
                                    transition={{ delay: Math.min(index * 0.04, 0.4), type: 'spring', stiffness: 300, damping: 26 }}
                                    className="flex gap-4"
                                >
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border bg-white ${e.cls}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-bold text-gray-800 truncate">{e.title}</h4>
                                            {e.badge && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-wide">
                                                    {e.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">{e.sub}</p>
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            <Clock size={11} />
                                            {format(e.date, 'd MMMM yyyy', { locale: ru })}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <History size={36} className="opacity-20 mb-3" />
                    <p className="font-medium">История пока пуста</p>
                </div>
            )}
        </div>
    );
};

export default CatTimeline;
