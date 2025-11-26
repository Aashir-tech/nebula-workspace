import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { TaskStatus } from '../types';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import TaskCard from './TaskCard';
import { motion, AnimatePresence } from 'motion/react';

type ViewType = 'month' | 'week';

export const CalendarView: React.FC = () => {
  const { tasks, currentWorkspace, addTask } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Filter tasks for current workspace
  const workspaceTasks = tasks.filter(
    t => currentWorkspace && t.workspaceId === currentWorkspace.id && !t.archived
  );

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    for (let i = 0; i < 42; i++) { // 6 weeks max
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      currentWeek.push(date);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    return { weeks, firstDay, lastDay };
  }, [currentDate]);

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return workspaceTasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Calendar
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white min-w-[180px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* View toggle */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewType === 'month'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewType('week')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewType === 'week'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2 auto-rows-fr">
          {calendarData.weeks.map((week, weekIndex) =>
            week.map((date, dayIndex) => {
              const dayTasks = getTasksForDate(date);
              const isDateToday = isToday(date);
              const isDateCurrentMonth = isCurrentMonth(date);

              return (
                <motion.div
                  key={`${weekIndex}-${dayIndex}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-[120px] p-2 rounded-lg border cursor-pointer transition-all ${
                    isDateToday
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500'
                      : isDateCurrentMonth
                      ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/50'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-50'
                  }`}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isDateToday
                          ? 'w-6 h-6 flex items-center justify-center rounded-full bg-indigo-600 text-white'
                          : isDateCurrentMonth
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    
                    {isDateCurrentMonth && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addTask('New Task', undefined, date);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded transition-opacity"
                      >
                        <Plus className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      </button>
                    )}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        className={`text-xs px-2 py-1 rounded truncate ${
                          task.status === TaskStatus.DONE
                            ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 line-through'
                            : task.priority === 'P1'
                            ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                            : task.priority === 'P2'
                            ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400'
                            : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                        }`}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 px-2">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Date Tasks Sidebar */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl overflow-y-auto z-50"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {getTasksForDate(selectedDate).length} tasks
              </p>
            </div>
            
            <div className="p-4 space-y-2">
              {getTasksForDate(selectedDate).map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              
              {getTasksForDate(selectedDate).length === 0 && (
                <div className="text-center py-8 text-slate-400 dark:text-slate-600">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tasks for this date</p>
                  <button
                    onClick={() => {
                      addTask('New Task', undefined, selectedDate);
                      setSelectedDate(null);
                    }}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Add Task
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarView;
