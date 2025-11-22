// app/dashboard/calendar/CalendarEventCard.tsx
"use client";

import { CalendarEvent } from "@/lib/calendarHelper";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Syringe, AlertTriangle, Clock } from "lucide-react";

interface CalendarEventCardProps {
  event: CalendarEvent;
  onConfirmClick: (event: CalendarEvent) => void;
  canEdit: boolean;
}

const CalendarEventCard: React.FC<CalendarEventCardProps> = ({ event, onConfirmClick, canEdit }) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const avatarSrc = event.catAvatarUrl
    ? `${appUrl}${event.catAvatarUrl}`
    : `https://placehold.co/24x24/e2e8f0/64748b?text=${event.catName.charAt(0)}`;

  // Определяем стили в зависимости от статуса события
  let containerClasses = "bg-gray-50 border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 hover:shadow-sm";
  let icon = <Clock size={14} className="text-gray-400" />;
  let statusText = "";

  if (event.isProjected) {
    if (event.isOverdue) {
        containerClasses = "bg-red-50 border-red-200 text-red-800 hover:bg-white hover:border-red-300 hover:shadow-red-100 hover:shadow-md";
        icon = <AlertTriangle size={14} className="text-red-500" />;
        statusText = "Просрочено";
    } else if (event.isUpcoming) {
        containerClasses = "bg-amber-50 border-amber-200 text-amber-800 hover:bg-white hover:border-amber-300 hover:shadow-amber-100 hover:shadow-md";
        icon = <Syringe size={14} className="text-amber-500" />;
        statusText = "Скоро";
    }
  } else {
      // Для уже выполненных событий (если они отображаются)
      containerClasses = "bg-emerald-50 border-emerald-200 text-emerald-800 opacity-70";
      icon = <Check size={14} className="text-emerald-500" />;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`
        group relative flex items-center justify-between
        p-2 rounded-xl border transition-all duration-200
        ${containerClasses}
      `}
    >
      <Link href={`/dashboard/cat/${event.catId}`} className="flex items-center gap-3 flex-grow min-w-0 pr-2">
        <div className="relative shrink-0">
            <img
            src={avatarSrc}
            alt={event.catName}
            className="h-8 w-8 rounded-lg object-cover border border-black/5 shadow-sm"
            />
            {/* Маленький индикатор статуса на аватарке */}
            {event.isProjected && (event.isOverdue || event.isUpcoming) && (
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${event.isOverdue ? 'bg-red-500' : 'bg-amber-500'}`} />
            )}
        </div>
        
        <div className="min-w-0 flex flex-col">
            <span className="text-sm font-bold truncate leading-tight">{event.catName}</span>
            <div className="flex items-center gap-1 text-[10px] font-medium opacity-80">
                {icon}
                <span className="truncate">{event.stageText}</span>
            </div>
        </div>
      </Link>
      
      {canEdit && event.canConfirmVaccination && (
        <button
          onClick={() => onConfirmClick(event)}
          className={`
            flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all
            ${event.isOverdue 
                ? 'bg-red-100 text-red-600 hover:bg-red-500 hover:text-white shadow-sm' 
                : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white shadow-sm'
            }
          `}
          title="Отметить как выполненную"
        >
          <Check size={18} strokeWidth={2.5} />
        </button>
      )}
    </motion.div>
  );
};

export default CalendarEventCard;