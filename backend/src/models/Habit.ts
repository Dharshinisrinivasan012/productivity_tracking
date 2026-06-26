import mongoose, { Schema } from 'mongoose';
import { IHabit } from '../types';

const habitSchema = new Schema<IHabit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    color: { type: String, default: '#6366f1' },
    icon: { type: String },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    targetCount: { type: Number, default: 1, min: 1 },
    completions: [
      {
        date: { type: Date, required: true },
        count: { type: Number, default: 1, min: 0 },
      },
    ],
  },
  { timestamps: true }
);

habitSchema.index({ userId: 1, name: 1 });
habitSchema.index({ userId: 1, 'completions.date': 1 });

export const Habit = mongoose.model<IHabit>('Habit', habitSchema);
