import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DatePickerProps {
    selectedDate: Date | null;
    onSelect?: (date: Date | null) => void;
    onChange?: (date: Date | null) => void;
    onClose?: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onSelect, onChange, onClose }) => {
    const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const isSameDay = (date1: Date, date2: Date | null) => {
        if (!date2) return false;
        return date1.toDateString() === date2.toDateString();
    };

    const handleDateClick = (day: number) => {
        const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (onChange) {
            onChange(selected);
        } else if (onSelect) {
            onSelect(selected);
            onClose?.();
        }
    };

    const handleQuickSelect = (date: Date | null) => {
        if (onChange) {
            onChange(date);
        } else if (onSelect) {
            onSelect(date);
            onClose?.();
        }
    };

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    return (
        <div className="w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4">
            {/* Quick Actions */}
            <div className="space-y-1 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => handleQuickSelect(today)}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-700 dark:text-slate-300">Today</span>
                    <span className="ml-auto text-xs text-slate-500">{today.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </button>
                <button
                    onClick={() => handleQuickSelect(tomorrow)}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span className="text-slate-700 dark:text-slate-300">Tomorrow</span>
                    <span className="ml-auto text-xs text-slate-500">{tomorrow.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </button>
                <button
                    onClick={() => handleQuickSelect(nextWeek)}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-slate-700 dark:text-slate-300">Next Week</span>
                    <span className="ml-auto text-xs text-slate-500">{nextWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </button>
                <button
                    onClick={() => handleQuickSelect(null)}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">No Date</span>
                </button>
            </div>

            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={previousMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                    <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                    <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-slate-500 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, today);
                    const isPast = date < today;

                    return (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className={`
                                aspect-square flex items-center justify-center text-sm rounded-lg transition-colors
                                ${isSelected 
                                    ? 'bg-indigo-600 text-white font-semibold' 
                                    : isToday
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                                        : isPast
                                            ? 'text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DatePicker;
