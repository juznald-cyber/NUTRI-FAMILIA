import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface WeekSelectorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function WeekSelector({ selectedDate, onSelectDate }: WeekSelectorProps) {
  const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  const today = new Date();

  const prevWeek = () => onSelectDate(addDays(selectedDate, -7));
  const nextWeek = () => onSelectDate(addDays(selectedDate, 7));

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <button onClick={prevWeek} className="p-2 hover:bg-apple-gray-1 rounded-full">
          <ChevronLeft size={20} className="text-apple-gray-5" />
        </button>
        <span className="font-semibold text-apple-gray-6 capitalize">
          {format(selectedDate, 'MMMM yyyy', { locale: es })}
        </span>
        <button onClick={nextWeek} className="p-2 hover:bg-apple-gray-1 rounded-full">
          <ChevronRight size={20} className="text-apple-gray-5" />
        </button>
      </div>

      <div className="flex justify-between px-2">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`flex flex-col items-center p-2 rounded-apple-lg min-w-[3rem] transition-all ${
                isSelected 
                  ? 'bg-apple-blue text-white shadow-apple-md' 
                  : 'hover:bg-apple-gray-1 text-apple-gray-5'
              }`}
            >
              <span className="text-xs font-medium uppercase mb-1">
                {format(day, 'EEE', { locale: es }).substring(0, 3)}
              </span>
              <span className={`text-lg font-semibold ${isSelected ? 'text-white' : 'text-apple-gray-6'}`}>
                {format(day, 'd')}
              </span>
              {isToday && (
                <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-apple-blue'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
