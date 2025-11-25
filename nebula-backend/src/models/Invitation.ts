import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitation extends Document {
  workspaceId: string;
  invitedBy: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  role: 'MEMBER' | 'ADMIN';
  createdAt: Date;
  expiresAt: Date;
}

const InvitationSchema = new Schema<IInvitation>({
  workspaceId: {
    type: String,
    required: true,
    index: true
  },
  invitedBy: {
    type: String,
    required: true
  },
  inviteeEmail: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  role: {
    type: String,
    enum: ['MEMBER', 'ADMIN'],
    default: 'MEMBER'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
});

// Index to find pending invitations for a user
InvitationSchema.index({ inviteeEmail: 1, status: 1 });

// Index to find invitations for a workspace
InvitationSchema.index({ workspaceId: 1, status: 1 });

export default mongoose.model<IInvitation>('Invitation', InvitationSchema);
