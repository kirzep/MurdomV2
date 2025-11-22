// app/dashboard/cat/[id]/CatReportTemplate.tsx
"use client";

import { Cat, TreatmentType } from '@/types';
import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FileText, PawPrint, CalendarDays, Syringe, Pill, ShieldCheck, Mail } from 'lucide-react';

interface CatReportTemplateProps {
  cat: Cat;
}

const treatmentMeta: Record<TreatmentType, { name: string; icon: React.ReactNode }> = {
  WORMS: { name: 'Дегельминтизация', icon: <Pill size={14} /> },
  FLEAS: { name: 'Обработка от паразитов', icon: <ShieldCheck size={14} /> },
  EAR_MITES: { name: 'Ушной клещ', icon: <ShieldCheck size={14} /> },
  VACCINATION: { name: 'Вакцинация', icon: <Syringe size={14} /> },
};

// Логотип для печати
const BrandLogo = () => (
    <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center">
            <PawPrint size={20} fill="currentColor" />
        </div>
        <div className="flex flex-col leading-none">
            <span className="font-bold text-lg text-gray-800 tracking-tight">МурДом</span>
            <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest">Архив</span>
        </div>
    </div>
);

export const CatReportTemplate = forwardRef<HTMLDivElement, CatReportTemplateProps>(({ cat }, ref) => {
  const age = cat.birthYear ? `${new Date().getFullYear() - cat.birthYear} лет` : 'Не указан';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  
  // Для печати лучше использовать полные пути, но иногда с crossOrigin бывают проблемы.
  // Если картинки не грузятся в PDF, убедись, что сервер отдает заголовки CORS.
  const avatarSrc = cat.avatarUrl 
    ? (cat.avatarUrl.startsWith('data:') ? cat.avatarUrl : `${appUrl}${cat.avatarUrl}`)
    : `https://placehold.co/300x300/e2e8f0/64748b?text=${cat.name.charAt(0)}`;

  const creatorName = cat.creator?.name || 'Администратор архива';
  const creatorEmail = cat.creator?.email;

  return (
    // Контейнер А4
    <div 
        ref={ref} 
        className="bg-white text-gray-800 font-sans relative" 
        style={{ width: '210mm', minHeight: '297mm', padding: '12mm' }}
    >
      {/* --- ШАПКА --- */}
      <header className="flex justify-between items-start pb-8 border-b-2 border-brand-primary/10">
        <div className="flex gap-6">
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm">
                 <img 
                    src={avatarSrc} 
                    crossOrigin="anonymous" 
                    alt={cat.name} 
                    className="w-full h-full object-cover"
                 />
            </div>
            
            <div className="pt-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-wider mb-2">
                    Медицинская карта
                </div>
                <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none mb-2">
                    {cat.name}
                </h1>
                <div className="text-sm text-gray-500 font-medium">
                    ID: <span className="font-mono text-gray-400">{cat.id}</span>
                </div>
            </div>
        </div>

        <div className="flex flex-col items-end gap-4">
            <BrandLogo />
            <div className="text-right">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Дата отчета</p>
                <p className="text-sm font-bold text-gray-700">{format(new Date(), 'd MMMM yyyy', { locale: ru })}</p>
            </div>
        </div>
      </header>

      {/* --- ОСНОВНАЯ ИНФОРМАЦИЯ --- */}
      <section className="mt-8 mb-10">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"/>
              Данные пациента
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <CalendarDays size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Возраст</span>
                </div>
                <p className="font-bold text-lg text-gray-800">{age}</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <CalendarDays size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Прибыл</span>
                </div>
                <p className="font-bold text-lg text-gray-800">
                    {cat.arrivalDate ? format(new Date(cat.arrivalDate), 'd MMM yyyy', { locale: ru }) : '—'}
                </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                 <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Mail size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Куратор</span>
                </div>
                <p className="font-bold text-sm text-gray-800 truncate">{creatorName}</p>
                {creatorEmail && <p className="text-xs text-gray-500 truncate">{creatorEmail}</p>}
            </div>
          </div>
      </section>

      {/* --- ВАКЦИНАЦИЯ И ОБРАБОТКИ --- */}
      {cat.treatments && cat.treatments.length > 0 ? (
        <section className="mb-10">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"/>
              Журнал процедур
          </h3>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                    <tr>
                        <th className="py-3 px-4 font-semibold w-1/3">Процедура</th>
                        <th className="py-3 px-4 font-semibold">Препарат</th>
                        <th className="py-3 px-4 font-semibold text-right">Дата проведения</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {cat.treatments.map((t) => (
                        <tr key={t.id} className="group">
                            <td className="py-3 px-4 font-medium text-gray-800 flex items-center gap-2">
                                <span className="text-gray-400 group-hover:text-brand-primary transition-colors">
                                    {treatmentMeta[t.type].icon}
                                </span>
                                {treatmentMeta[t.type].name}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                                {t.productName}
                                {t.vaccinationStage && (
                                    <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                                        {t.vaccinationStage === 'first' ? '1 этап' : (t.vaccinationStage === 'second' ? '2 этап' : 'Ежегодно')}
                                    </span>
                                )}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-gray-500">
                                {format(new Date(t.date), 'dd.MM.yyyy')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="mb-10 p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center text-gray-400 text-sm">
            Записей о лечении пока нет.
        </div>
      )}

      {/* --- ДОКУМЕНТЫ --- */}
      {cat.documents && cat.documents.length > 0 && (
        <section className="mb-10 break-inside-avoid">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"/>
              Реестр документов
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
              {cat.documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                          <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-800 truncate">{doc.fileName}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">PDF / IMG</p>
                      </div>
                  </div>
              ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-4 italic text-center">
              * Копии файлов документов приложены к данному отчету на следующих страницах.
          </p>
        </section>
      )}

      {/* --- ФУТЕР --- */}
      <footer className="absolute bottom-12 left-12 right-12 pt-6 border-t border-gray-200 flex justify-between items-end text-xs text-gray-400">
        <div>
            <p className="font-bold text-gray-600 mb-1">Электронный архив "МурДом"</p>
            <p>Документ сгенерирован автоматически.</p>
        </div>
        <div className="text-right">
             <div className="w-24 h-12 mb-2 ml-auto opacity-50">
                 {/* Место для штрих-кода или печати */}
                 <div className="w-full h-full border border-gray-300 flex items-center justify-center bg-gray-50 text-[10px]">
                    МЕСТО ПЕЧАТИ
                 </div>
             </div>
             <p>{cat.id}</p>
        </div>
      </footer>
    </div>
  );
});

CatReportTemplate.displayName = 'CatReportTemplate';