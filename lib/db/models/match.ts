import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './user';

export interface IMatch extends Document {
  users: mongoose.Types.ObjectId[] | IUser[];
  matchScore: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const matchSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  matchScore: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'completed'], 
    default: 'pending' 
  },
}, { timestamps: true });

// Ensure there are exactly 2 users in each match
matchSchema.pre('save', function(next) {
  if (this.users.length !== 2) {
    return next(new Error('A match must have exactly 2 users'));
  }
  next();
});

// Delete and recreate model to prevent overwrite errors in development
export const Match: Model<IMatch> = mongoose.models.Match || mongoose.model<IMatch>('Match', matchSchema);