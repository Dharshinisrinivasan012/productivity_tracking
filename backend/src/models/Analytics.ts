import mongoose, { Schema } from 'mongoose';
import { IAnalytics } from '../types';

const analyticsSchema = new Schema<IAnalytics>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    tasksCompleted: { type: Number, default: 0 },
    tasksCreated: { type: Number, default: 0 },
    habitsCompleted: { type: Number, default: 0 },
    studyMinutes: { type: Number, default: 0 },
    productivityScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

analyticsSchema.index({ userId: 1, date: 1 }, { unique: true });
analyticsSchema.index({ userId: 1, date: -1 });

export const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);
