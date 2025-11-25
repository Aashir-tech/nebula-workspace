import mongoose, { Schema } from 'mongoose';
import { IWorkspace, WorkspaceType } from '../types/index.js';
import { nanoid } from 'nanoid';

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: { 
      type: String, 
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [100, 'Workspace name cannot exceed 100 characters']
    },
    type: { 
      type: String, 
      enum: Object.values(WorkspaceType), 
      required: [true, 'Workspace type is required']
    },
    ownerId : { 
      type: Schema.Types.ObjectId as any, 
      ref: 'User',
      required: [true, 'Owner is required']
    },
    inviteCode: { 
      type: String, 
      unique: true,
      default: () => nanoid(10) // Generates unique 10-char code
    },
    members: [{
      userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
      },
      role: { 
        type: String, 
        enum: ['OWNER', 'ADMIN', 'MEMBER'],
        default: 'MEMBER'
      },
      joinedAt: { 
        type: Date, 
        default: Date.now 
      }
    }]
  },
  { timestamps: true }
);

// Indexes for performance
WorkspaceSchema.index({ ownerId: 1 });
WorkspaceSchema.index({ inviteCode: 1 });

export default mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
