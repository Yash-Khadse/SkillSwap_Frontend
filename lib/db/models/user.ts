import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISchedule {
  day: string;
  startTime: string;
  endTime: string;
}

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  googleId: string;
  teachSkills: string[];
  learnSkills: string[];
  bio: string;
  availability: ISchedule[];
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String },
  googleId: { type: String, required: true, unique: true },
  teachSkills: { type: [String], default: [], validate: [arrayLimit, '{PATH} exceeds the limit of 5'] },
  learnSkills: { type: [String], default: [], validate: [arrayLimit, '{PATH} exceeds the limit of 5'] },
  bio: { type: String, default: '' },
  availability: { type: [scheduleSchema], default: [] },
  profileCompleted: { type: Boolean, default: false },
}, { timestamps: true });

function arrayLimit(val: string[]) {
  return val.length <= 5;
}

// Delete and recreate model to prevent overwrite errors in development
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);