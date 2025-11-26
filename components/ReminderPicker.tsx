import React, { useState } from 'react';
import { Clock, Calendar as CalendarIcon, X, ChevronDown } from 'lucide-react';
import DatePicker from './DatePicker';

export type ReminderTime = '15min' | '30min' | '1hour' | '2hours' | 'custom' | null;

interface ReminderPickerProps {
    selectedReminder: ReminderTime;
    customDate?: Date;
    onChange: (reminder: ReminderTime, customDate?: Date) => void;
}

const ReminderPicker: React.FC<ReminderPickerProps> = ({ 
    selectedReminder, 
    customDate,
    onChange 
}) => {
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(customDate || new Date());
    const [selectedHour, setSelectedHour] = useState(new Date().getHours());
    const [selectedMinute, setSelectedMinute] = useState(0);

    const reminderOptions = [
        { value: '15min' as ReminderTime, label: '15 minutes', icon: '⚡', color: 'text-amber-600 dark:text-amber-400' },
        { value: '30min' as ReminderTime, label: '30 minutes', icon: '⏱️', color: 'text-orange-600 dark:text-orange-400' },
        { value: '1hour' as ReminderTime, label: '1 hour', icon: '🕐', color: 'text-blue-600 dark:text-blue-400' },
        { value: '2hours' as ReminderTime, label: '2 hours', icon: '🕑', color: 'text-indigo-600 dark:text-indigo-400' },
    ];

    const handleQuickSelect = (reminder: ReminderTime) => {
        onChange(reminder);
    };

    const handleCustomSubmit = () => {
        const customDateTime = new Date(selectedDate);
        customDateTime.setHours(selectedHour, selectedMinute, 0, 0);
        onChange('custom', customDateTime);
        setShowCustomPicker(false);
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = [0, 15, 30, 45];

    return (
        <div className="w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl">
            {!showCustomPicker ? (
                <div className="p-3">
                    {/* Quick Options */}
                    <div className="space-y-1 mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                        {reminderOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => handleQuickSelect(option.value)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 ${
                                    selectedReminder === option.value
                                        ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-transparent'
                                }`}
                            >
                                <span className="text-xl">{option.icon}</span>
                                <div className="flex-1">
                                    <div className={`text-sm font-medium ${option.color}`}>
                                        {option.label}
                                    </div>
                                </div>
                                {selectedReminder === option.value && (
                                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Custom Option */}
                    <button
                        onClick={() => setShowCustomPicker(true)}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3"
                    >
                        <CalendarIcon className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Custom date & time
                        </span>
                    </button>

                    {/* Clear */}
                    <div className="h-px bg-slate-200 dark:border-slate-700 my-2" />
                    <button
                        onClick={() => onChange(null)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">No reminder</span>
                    </button>
                </div>
            ) : (
                <div className="p-4">
                    {/* Custom Date & Time Picker */}
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Set Custom Reminder
                        </h3>

                        {/* Date Picker */}
                        {/* Date Picker */}
                        <div className="mb-4">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                                Date
                            </label>
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-1 border border-slate-100 dark:border-slate-700/50">
                                <DatePicker
                                    selectedDate={selectedDate}
                                    onChange={(date) => date && setSelectedDate(date)}
                                />
                            </div>
                        </div>

                        {/* Time Picker */}
                        <div className="mb-6">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                                Time
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Hour Selector */}
                                <div className="relative">
                                    <select
                                        value={selectedHour}
                                        onChange={(e) => setSelectedHour(Number(e.target.value))}
                                        className="w-full appearance-none px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-slate-900 dark:text-white transition-all"
                                    >
                                        {hours.map(hour => (
                                            <option key={hour} value={hour}>
                                                {hour.toString().padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                    <p className="text-[10px] font-medium text-slate-400 mt-1.5 text-center uppercase tracking-wide">Hour</p>
                                </div>

                                {/* Minute Selector */}
                                <div className="relative">
                                    <select
                                        value={selectedMinute}
                                        onChange={(e) => setSelectedMinute(Number(e.target.value))}
                                        className="w-full appearance-none px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-slate-900 dark:text-white transition-all"
                                    >
                                        {minutes.map(minute => (
                                            <option key={minute} value={minute}>
                                                {minute.toString().padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                    <p className="text-[10px] font-medium text-slate-400 mt-1.5 text-center uppercase tracking-wide">Minute</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowCustomPicker(false)}
                            className="flex-1 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleCustomSubmit}
                            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 rounded-lg transition-colors"
                        >
                            Set Reminder
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReminderPicker;
