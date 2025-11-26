import { ReminderTime } from '../components/ReminderPicker';

export const calculateReminderDate = (
    reminder: ReminderTime, 
    customReminderDate: Date | undefined, 
    dueDate: Date | null
): Date | null => {
    if (customReminderDate) {
        return customReminderDate;
    } 
    
    if (reminder && dueDate) {
        // Calculate reminder time based on due date
        const due = new Date(dueDate);
        switch (reminder) {
            case '15min':
                return new Date(due.getTime() - 15 * 60000);
            case '30min':
                return new Date(due.getTime() - 30 * 60000);
            case '1hour':
                return new Date(due.getTime() - 60 * 60000);
            case '2hours':
                return new Date(due.getTime() - 120 * 60000);
        }
    } else if (reminder) {
        // Set reminder from now
        const now = new Date();
        switch (reminder) {
            case '15min':
                return new Date(now.getTime() + 15 * 60000);
            case '30min':
                return new Date(now.getTime() + 30 * 60000);
            case '1hour':
                return new Date(now.getTime() + 60 * 60000);
            case '2hours':
                return new Date(now.getTime() + 120 * 60000);
        }
    }
    
    return null;
};
