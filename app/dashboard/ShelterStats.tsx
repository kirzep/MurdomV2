// app/dashboard/ShelterStats.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { Cat as CatType } from '@/types';
import { RevaccinationInfo } from '@/lib/revaccinationHelper';
import { Cat, Archive, Home, AlertTriangle, ChevronDown, PieChart, Syringe, ShieldCheck } from 'lucide-react';

// Число, плавно "накручивающееся" от 0 до value при появлении
function CountUp({ value }: { value: number }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const controls = animate(0, value, {
            duration: 0.9,
            ease: 'easeOut',
            onUpdate: (v) => setDisplay(Math.round(v)),
        });
        return () => controls.stop();
    }, [value]);
    return <>{display}</>;
}

interface ShelterStatsProps {
    cats: CatType[];
    alerts: { cat: CatType; alert: RevaccinationInfo }[];
}

export default function ShelterStats({ cats, alerts }: ShelterStatsProps) {
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('statsPanelCollapsed') === '1') {
            setCollapsed(true);
        }
    }, []);

    const toggle = () => {
        setCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('statsPanelCollapsed', next ? '1' : '0');
            }
            return next;
        });
    };

    const total = cats.length;
    const inShelter = cats.filter((c) => c.status === 'В приюте').length;
    const atHome = cats.filter((c) => c.status === 'Дома').length;
    const rainbow = cats.filter((c) => c.status === 'Умерли').length;

    const attention = alerts.length;
    const overdue = alerts.filter((a) => a.alert.isOverdue).length;
    const upcoming = attention - overdue;

    const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

    const metrics = [
        { key: 'total', label: 'Всего', value: total, Icon: Cat, num: 'text-gray-800', bg: 'bg-[#faf8f4]' },
        { key: 'shelter', label: 'В приюте', value: inShelter, Icon: Archive, num: 'text-gray-800', bg: 'bg-[#faf8f4]' },
        { key: 'home', label: 'Дома', value: atHome, Icon: Home, num: 'text-emerald-600', bg: 'bg-emerald-50/60' },
        { key: 'attention', label: 'Внимание', value: attention, Icon: AlertTriangle, num: 'text-red-500', bg: 'bg-red-50' },
    ];

    const segments = [
        { label: 'В приюте', value: inShelter, color: '#5D001E' },
        { label: 'Дома', value: atHome, color: '#0f9d75' },
        { label: 'На радуге', value: rainbow, color: '#b4b2a9' },
    ].filter((s) => s.value > 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_4px_20px_-12px_rgba(0,0,0,0.15)] rounded-3xl p-5 sm:p-6"
        >
            {/* Заголовок + сворачивание */}
            <button
                onClick={toggle}
                className="w-full flex items-center gap-3 group btn-spring active:scale-[0.99]"
                aria-expanded={!collapsed}
            >
                <span className="w-9 h-9 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center shrink-0">
                    <PieChart size={18} />
                </span>
                <span className="text-base font-bold text-gray-800">Сводка приюта</span>
                <motion.span
                    className="ml-auto text-gray-400 group-hover:text-gray-600"
                    animate={{ rotate: collapsed ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown size={20} />
                </motion.span>
            </button>

            <AnimatePresence initial={false}>
                {!collapsed && (
                    <motion.div
                        key="stats-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="pt-5">
                            {/* Метрики */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {metrics.map((m) => (
                                    <div key={m.key} className={`${m.bg} rounded-2xl p-3`}>
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                                            <m.Icon size={13} />
                                            {m.label}
                                        </div>
                                        <div className={`text-2xl sm:text-3xl font-black mt-1 leading-none ${m.num}`}>
                                            <CountUp value={m.value} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Полоска распределения */}
                            {total > 0 && (
                                <>
                                    <div className="flex gap-0.5 h-3 mt-5 rounded-full overflow-hidden">
                                        {segments.map((s) => (
                                            <motion.div
                                                key={s.label}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct(s.value)}%` }}
                                                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
                                                style={{ backgroundColor: s.color }}
                                                className="h-full"
                                            />
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5">
                                        {segments.map((s) => (
                                            <span key={s.label} className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: s.color }} />
                                                {s.label} · {s.value}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Ближайшие вакцинации */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm">
                                {attention > 0 ? (
                                    <>
                                        <Syringe size={16} className="text-brand-primary shrink-0" />
                                        <span className="text-gray-500 font-medium">
                                            Вакцинации:{' '}
                                            {overdue > 0 && <span className="text-red-500 font-bold">{overdue} просрочено</span>}
                                            {overdue > 0 && upcoming > 0 && <span className="text-gray-400"> · </span>}
                                            {upcoming > 0 && <span className="text-amber-600 font-bold">{upcoming} на этой неделе</span>}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                                        <span className="text-gray-500 font-medium">Все прививки в порядке</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
