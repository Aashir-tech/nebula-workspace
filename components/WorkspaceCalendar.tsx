import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { TaskStatus } from '../types';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, X, Edit2, Trash2 } from 'lucide-react';
import TaskCard from './TaskCard';
import { motion, AnimatePresence } from 'motion/react';

interface WorkspaceCalendarProps {
  workspaceId: string;
}

const WorkspaceCalendar: React.FC<WorkspaceCalendarProps> = ({ workspaceId }) => {
  const { tasks, addTask, deleteTask, updateTask } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Filter tasks for this workspace
  const workspaceTasks = tasks.filter(
    t => t.workspaceId === workspaceId && !t.archived
  );

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    for (let i = 0; i < 42; i++) {
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

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
      setSelectedTask(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
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

        <button
          onClick={goToToday}
          className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors"
        >
          Today
        </button>
      </div>

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
      <div className="grid grid-cols-7 gap-2 auto-rows-fr flex-1">
        {calendarData.weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const dayTasks = getTasksForDate(date);
            const isDateToday = isToday(date);
            const isDateCurrentMonth = isCurrentMonth(date);

            return (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                className={`min-h-[100px] p-2 rounded-lg border transition-all group ${
                  isDateToday
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500'
                    : isDateCurrentMonth
                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/50'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-50'
                }`}
              >
                {/* Date number */}
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={() => setSelectedDate(date)}
                    className={`text-sm font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors ${
                      isDateToday
                        ? 'w-6 h-6 flex items-center justify-center rounded-full bg-indigo-600 text-white'
                        : isDateCurrentMonth
                        ? 'text-slate-900 dark:text-white px-1'
                        : 'text-slate-400 dark:text-slate-600 px-1'
                    }`}
                    title="View tasks for this date"
                  >
                    {date.getDate()}
                  </button>
                  
                  {isDateCurrentMonth && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addTask('New Task', undefined, date);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded transition-opacity"
                      title="Quick add task"
                    >
                      <Plus className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    </button>
                  )}
                </div>

                {/* Tasks */}
                <div className="space-y-1 overflow-y-auto max-h-[70px] custom-scrollbar">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(task.id);
                        setSelectedDate(date);
                      }}
                      className={`text-xs px-2 py-1 rounded truncate cursor-pointer group/task flex items-center justify-between ${
                        task.status === TaskStatus.DONE
                          ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 line-through'
                          : task.priority === 'P1'
                          ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                          : task.priority === 'P2'
                          ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400'
                          : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                      }`}
                    >
                      <span className="truncate flex-1">{task.title}</span>
                      <div className="hidden group-hover/task:flex items-center gap-1 ml-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(task.id);
                          }}
                          className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="p-0.5 hover:bg-red-500/20 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <button
                      onClick={() => setSelectedDate(date)}
                      className="text-xs text-slate-500 dark:text-slate-400 px-2 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      +{dayTasks.length - 3} more
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Selected Task Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <TaskCard task={tasks.find(t => t.id === selectedTask)!} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Date Sidebar */}
      <AnimatePresence>
        {selectedDate && !selectedTask && (
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
                  <X className="w-5 h-5" />
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
                  <p className="mb-4">No tasks for this date</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        addTask('New Task', undefined, selectedDate);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkspaceCalendar;
