// app/dashboard/calendar/CalendarEventCard.tsx
"use client";

import { CalendarEvent } from "@/lib/calendarHelper";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";

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

  let colorClasses = "bg-indigo-50 text-indigo-700 hover:bg-indigo-100";
  if (event.isProjected) {
    if (event.isOverdue) colorClasses = "bg-red-100 text-red-800 hover:bg-red-200";
    else if (event.isUpcoming) colorClasses = "bg-amber-100 text-amber-800 hover:bg-amber-200";
    else colorClasses = "bg-gray-100 text-gray-600 hover:bg-gray-200";
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex items-center gap-2 rounded-md p-1.5 text-xs font-medium transition-colors ${colorClasses}`}
    >
      <Link href={`/dashboard/cat/${event.catId}`} className="flex items-center gap-2 flex-grow min-w-0">
        <img
          src={avatarSrc}
          alt={event.catName}
          className="h-5 w-5 flex-shrink-0 rounded-full border border-white/50"
        />
        <span className="truncate">{event.catName}</span>
        {event.isProjected && (
          <span className="ml-auto font-bold flex-shrink-0" title="Прогнозируемое событие">!</span>
        )}
      </Link>
      
      {canEdit && event.canConfirmVaccination && (
        <button
          onClick={() => onConfirmClick(event)}
          className="flex-shrink-0 w-5 h-5 bg-green-200 text-green-800 rounded-full flex items-center justify-center hover:bg-green-300 transition-colors"
          title="Отметить как выполненную"
        >
          <Check size={12} />
        </button>
      )}
    </motion.div>
  );
};

export default CalendarEventCard;