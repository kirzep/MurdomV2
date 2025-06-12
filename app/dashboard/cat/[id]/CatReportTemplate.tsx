// app/dashboard/cat/[id]/CatReportTemplate.tsx
"use client";

import { Cat, TreatmentType } from '@/types';
import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FileText, Cat as CatIcon } from 'lucide-react';

interface CatReportTemplateProps {
  cat: Cat;
}

const treatmentMeta: Record<TreatmentType, { name: string }> = {
  WORMS: { name: 'Дегельминтизация' },
  FLEAS: { name: 'Обработка от эктопаразитов' },
  EAR_MITES: { name: 'Акарицидная обработка' },
  VACCINATION: { name: 'Вакцинация' },
};

const MurDomLogo = () => (
    <div className="flex items-center gap-2 text-gray-500">
        <CatIcon size={24} />
        <span className="font-bold text-lg">МурДом</span>
    </div>
);

export const CatReportTemplate = forwardRef<HTMLDivElement, CatReportTemplateProps>(({ cat }, ref) => {
  const age = cat.birthYear ? `${new Date().getFullYear() - cat.birthYear} лет` : 'Не указан';
  
  return (
    <div ref={ref} className="bg-white text-gray-800 p-10 font-sans" style={{ width: '210mm', minHeight: '297mm' }}>
      <header className="flex items-start justify-between pb-4 border-b-2 border-gray-200">
        <div className="flex items-center gap-6">
            <img src={cat.avatarUrl || ''} crossOrigin="anonymous" alt={cat.name} className="w-28 h-28 rounded-full object-cover border-4 border-indigo-100"/>
            <div>
              <h1 className="text-4xl font-bold text-indigo-600">{cat.name}</h1>
              <p className="text-gray-500 text-xl">Медицинская карта</p>
            </div>
        </div>
        <MurDomLogo />
      </header>

      <section className="my-8 grid grid-cols-2 gap-6 text-base">
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Возраст (приблизительно)</p>
          <p className="font-semibold text-lg">{age}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Дата поступления</p>
          <p className="font-semibold text-lg">{cat.arrivalDate ? format(new Date(cat.arrivalDate), 'd MMMM yyyy г.', { locale: ru }) : 'Не указана'}</p>
        </div>
      </section>

      {cat.treatments && cat.treatments.length > 0 && (
        <section className="my-8">
          <h2 className="text-2xl font-semibold border-b border-gray-200 pb-2 mb-4">Обработки и Вакцинации</h2>
          <table className="w-full text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="py-2 px-3 font-semibold">Тип</th>
                <th className="py-2 px-3 font-semibold">Препарат/Вакцина</th>
                <th className="py-2 px-3 font-semibold text-right">Дата</th>
              </tr>
            </thead>
            <tbody>
              {cat.treatments.map(t => (
                <tr key={t.id} className="border-b border-gray-100">
                  <td className="py-3 px-3 capitalize">{treatmentMeta[t.type].name}</td>
                  <td className="py-3 px-3">{t.productName}</td>
                  <td className="py-3 px-3 text-right font-mono">{format(new Date(t.date), 'dd.MM.yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {cat.documents && cat.documents.length > 0 && (
        <section className="my-8">
          <h2 className="text-2xl font-semibold border-b border-gray-200 pb-2 mb-3">Приложенные документы</h2>
           <ul className="list-none space-y-2">
              {cat.documents.map(doc => (
                  <li key={doc.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-md">
                      <FileText size={16} className="text-gray-500" />
                      <span>{doc.fileName}</span>
                  </li>
              ))}
           </ul>
           <p className="text-xs text-gray-400 mt-2">Изображения-приложения будут добавлены на следующих страницах этого документа.</p>
        </section>
      )}

      <footer className="pt-4 text-center text-xs text-gray-400 border-t mt-10">
        Отчет сгенерирован {format(new Date(), 'd MMMM yyyy г., HH:mm')} © МурДом
      </footer>
    </div>
  );
});

CatReportTemplate.displayName = 'CatReportTemplate';
