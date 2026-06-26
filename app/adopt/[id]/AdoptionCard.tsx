// app/adopt/[id]/AdoptionCard.tsx
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Gift, Calendar, Share2, Check, Home, PawPrint } from 'lucide-react';

interface AdoptionCardProps {
    name: string;
    avatarSrc: string;
    ageLabel: string | null;
    arrivalLabel: string | null;
    description: string;
    adopted: boolean;
    shareUrl: string;
    contact?: string | null;
}

const contactHref = (contact: string) => {
    const c = contact.trim();
    if (/^https?:\/\//i.test(c)) return c;
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c)) return `mailto:${c}`;
    if (/^[+\d][\d\s()-]{5,}$/.test(c)) return `tel:${c.replace(/\s/g, '')}`;
    return c;
};

export default function AdoptionCard({
    name, avatarSrc, ageLabel, arrivalLabel, description, adopted, shareUrl, contact,
}: AdoptionCardProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const data = {
            title: adopted ? `${name} уже дома` : `${name} ищет дом`,
            text: adopted ? `${name} нашёл свой дом!` : `Помогите ${name} найти дом!`,
            url: shareUrl,
        };
        if (typeof navigator !== 'undefined' && navigator.share) {
            try { await navigator.share(data); } catch { /* отменено пользователем */ }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch { /* clipboard недоступен */ }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative">
            {/* Декор фона */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-rose-300/20 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className="w-full max-w-sm relative z-10"
            >
                <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-25px_rgba(93,0,30,0.4)]">
                    {/* Фото */}
                    <div className="relative aspect-square bg-gradient-to-br from-brand-primary-light to-rose-200">
                        <img src={avatarSrc} alt={name} className="w-full h-full object-cover" />
                        <span className={`absolute top-4 left-4 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg ${adopted ? 'bg-emerald-500/90 text-white' : 'bg-white/90 text-brand-primary'}`}>
                            {adopted ? <><Home size={14} /> Уже дома</> : <><PawPrint size={14} /> Ищу дом</>}
                        </span>
                    </div>

                    {/* Тело */}
                    <div className="p-6">
                        <h1 className="text-3xl font-black text-gray-800 tracking-tight leading-none">{name}</h1>

                        <div className="flex flex-wrap gap-2 mt-4">
                            {ageLabel && (
                                <span className="flex items-center gap-1.5 bg-[#faf8f4] border border-[#efece4] rounded-xl px-3 py-1.5 text-sm font-semibold text-gray-600">
                                    <Gift size={15} className="text-brand-primary" /> {ageLabel}
                                </span>
                            )}
                            {arrivalLabel && (
                                <span className="flex items-center gap-1.5 bg-[#faf8f4] border border-[#efece4] rounded-xl px-3 py-1.5 text-sm font-semibold text-gray-600">
                                    <Calendar size={15} className="text-blue-500" /> {arrivalLabel}
                                </span>
                            )}
                        </div>

                        <p className="mt-4 text-sm leading-relaxed text-gray-500">{description}</p>

                        {/* CTA */}
                        {adopted ? (
                            <div className="mt-5 w-full bg-emerald-50 text-emerald-700 rounded-2xl p-4 text-center text-sm font-bold flex items-center justify-center gap-2">
                                <Heart size={16} fill="currentColor" /> Нашёл свой дом!
                            </div>
                        ) : contact ? (
                            <a
                                href={contactHref(contact)}
                                className="mt-5 w-full bg-gradient-to-tr from-brand-primary to-rose-500 text-white rounded-2xl p-4 font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/30 btn-spring active:scale-95"
                            >
                                <Heart size={18} /> Хочу познакомиться
                            </a>
                        ) : (
                            <div className="mt-5 w-full bg-brand-primary-light text-brand-primary rounded-2xl p-4 text-center text-sm font-bold flex items-center justify-center gap-2">
                                <Heart size={16} /> Свяжитесь с приютом, чтобы познакомиться
                            </div>
                        )}

                        {/* Поделиться */}
                        <button
                            onClick={handleShare}
                            className="mt-3 w-full border border-gray-200 text-gray-600 rounded-2xl p-3 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 btn-spring active:scale-95"
                        >
                            {copied ? <><Check size={16} className="text-emerald-500" /> Ссылка скопирована</> : <><Share2 size={16} /> Поделиться</>}
                        </button>

                        <p className="mt-4 text-center text-xs text-gray-400">
                            Приют «Murdom» · поделитесь, чтобы помочь найти дом
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
