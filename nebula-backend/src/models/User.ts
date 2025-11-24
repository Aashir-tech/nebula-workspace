import mongoose, { Schema, Document } from 'mongoose';
import { IUser, WorkspaceType } from '../types/index.js';

const UserSchema = new Schema<IUser>(
  {
    name: { 
      type: String, 
      required: [true, 'Name is required'],
      trim: true
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        message: 'Invalid email format'
      }
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    avatarUrl: { 
      type: String,
      default: function() {
        // Generate a consistent avatar based on email
        const seed = this.email.charCodeAt(0);
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
      }
    },
    
    // Gamification fields
    streak: { 
      type: Number, 
      default: 0,
      min: 0
    },
    lastTaskDate: { 
      type: Date, 
      default: null 
    },
    
    // Workspace associations
    workspaces: [{
      workspaceId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Workspace' 
      },
      role: { 
        type: String, 
        enum: ['OWNER', 'MEMBER'], 
        default: 'MEMBER' 
      }
    }]
  },
  { 
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      }
    }
  }
);

// Index for faster email lookups
UserSchema.index({ email: 1 });

export default mongoose.model<IUser>('User', UserSchema);
