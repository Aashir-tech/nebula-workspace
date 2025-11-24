import mongoose, { Schema } from 'mongoose';
import { ITask, TaskStatus, Block } from '../types/index.js';

const BlockSchema = new Schema<Block>(
  {
    id: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ['paragraph', 'h1', 'h2', 'h3', 'bullet', 'todo'],
      required: true
    },
    content: { 
      type: String, 
      default: '' 
    },
    checked: { 
      type: Boolean, 
      default: false 
    }
  },
  { _id: false } // Don't create MongoDB IDs for sub-documents
);

const TaskSchema = new Schema<ITask>(
  {
    workspaceId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Workspace',
      required: [true, 'Workspace is required']
    },
    title: { 
      type: String, 
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    contentBlocks: { 
      type: [BlockSchema], 
      default: [] 
    },
    status: { 
      type: String, 
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO
    },
    tags: [{ 
      type: String,
      trim: true,
      maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    assigneeId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      default: null
    },
    aiEnhanced: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

// Indexes for efficient queries
TaskSchema.index({ workspaceId: 1, status: 1 });
TaskSchema.index({ createdAt: -1 });

export default mongoose.model<ITask>('Task', TaskSchema);
