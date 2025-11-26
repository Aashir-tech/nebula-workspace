import mongoose, { Schema } from 'mongoose';

export interface IReminder {
  _id: string;
  taskId: string;
  userId: string;
  reminderType: '30min' | '1hour' | '3hours' | '1day' | 'custom';
  reminderTime: Date;
  sent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    taskId: { 
      type: Schema.Types.ObjectId as any, 
      ref: 'Task',
      required: [true, 'Task is required']
    },
    userId: { 
      type: Schema.Types.ObjectId as any, 
      ref: 'User',
      required: [true, 'User is required']
    },
    reminderType: {
      type: String,
      enum: ['30min', '1hour', '3hours', '1day', 'custom'],
      required: true
    },
    reminderTime: {
      type: Date,
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Indexes for efficient queries
ReminderSchema.index({ taskId: 1 });
ReminderSchema.index({ userId: 1, sent: 1 });
ReminderSchema.index({ reminderTime: 1, sent: 1 });

export default mongoose.model<IReminder>('Reminder', ReminderSchema);
