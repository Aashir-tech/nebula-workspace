import mongoose, { Schema } from 'mongoose';

export interface IComment {
  _id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
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
    userName: {
      type: String,
      required: true
    },
    userAvatar: {
      type: String,
      default: null
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters']
    }
  },
  { timestamps: true }
);

// Indexes for efficient queries
CommentSchema.index({ taskId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1 });

export default mongoose.model<IComment>('Comment', CommentSchema);
