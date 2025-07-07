// lib/calendarHelper.ts
import { Cat, Treatment, TreatmentType } from '@/types';
import { addDays, addYears, isPast, isToday, differenceInDays, startOfDay, isAfter, isSameDay } from 'date-fns';

export interface CalendarEvent {
  catId: string;
  catName: string;
  catAvatarUrl: string | null;
  date: Date;
  stage: 'first' | 'second' | 'annual';
  stageText: string;
  isProjected: boolean;
  isOverdue: boolean;
  isUpcoming: boolean;
}

const STAGE_DETAILS = {
  first: { text: 'Первичная вакцинация' },
  second: { text: 'Ревакцинация' },
  annual: { text: 'Ежегодная вакцинация' },
};

export function generateVaccinationEvents(cats: Cat[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const today = startOfDay(new Date());

  // 👇 ФИЛЬТРУЕМ КОШЕК, ОСТАВЛЯЯ ТОЛЬКО ТЕХ, КТО В ПРИЮТЕ
  const activeCats = cats.filter(cat => cat.status === 'В приюте');

  activeCats.forEach(cat => {
    const allVaccinations = (cat.treatments ?? [])
      .filter(t => t.type === TreatmentType.VACCINATION && t.vaccinationStage)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    allVaccinations.forEach(v => {
      const stage = (v.vaccinationStage === 'revaccination' ? 'annual' : v.vaccinationStage) as 'first' | 'second' | 'annual';
      events.push({
        catId: cat.id,
        catName: cat.name,
        catAvatarUrl: cat.avatarUrl,
        date: new Date(v.date),
        stage: stage,
        stageText: STAGE_DETAILS[stage].text,
        isProjected: false,
        isOverdue: isPast(new Date(v.date)) && !isToday(new Date(v.date)),
        isUpcoming: differenceInDays(new Date(v.date), today) <= 7 && !isPast(new Date(v.date)),
      });
    });

    const pastVaccinations = allVaccinations.filter(v => !isAfter(startOfDay(new Date(v.date)), today));
    
    const firstVaccination = pastVaccinations.find(v => v.vaccinationStage === 'first');
    const secondVaccination = pastVaccinations.find(v => v.vaccinationStage === 'second');
    const lastAnnualVaccination = pastVaccinations.filter(v => v.vaccinationStage === 'revaccination').pop();
    
    let projectedDate: Date | null = null;
    let projectedStage: 'second' | 'annual' | null = null;

    if (lastAnnualVaccination) {
        projectedDate = addYears(new Date(lastAnnualVaccination.date), 1);
        projectedStage = 'annual';
    } else if (firstVaccination) {
        if (!secondVaccination) {
            projectedDate = addDays(new Date(firstVaccination.date), 28);
            projectedStage = 'second';
        } else {
            projectedDate = addYears(new Date(firstVaccination.date), 1);
            projectedStage = 'annual';
        }
    }
    
    if (projectedDate && projectedStage) {
        const hasMatchingRealEvent = allVaccinations.some(v => 
            v.vaccinationStage === projectedStage && 
            isSameDay(new Date(v.date), projectedDate)
        );

        if (!hasMatchingRealEvent) {
             const isOverdue = isPast(projectedDate) && !isToday(projectedDate);
             const daysUntil = differenceInDays(projectedDate, today);
             const isUpcoming = !isOverdue && daysUntil >= 0 && daysUntil <= 7;
    
            events.push({
                catId: cat.id,
                catName: cat.name,
                catAvatarUrl: cat.avatarUrl,
                date: projectedDate,
                stage: projectedStage,
                stageText: STAGE_DETAILS[projectedStage].text,
                isProjected: true,
                isOverdue,
                isUpcoming,
            });
        }
    }
  });

  return events;
}