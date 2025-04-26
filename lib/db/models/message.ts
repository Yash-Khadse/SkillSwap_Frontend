import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  matchId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
}

const messageSchema = new Schema({
  matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

// Create indexes for efficient querying
messageSchema.index({ matchId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

// Delete and recreate model to prevent overwrite errors in development
export const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);