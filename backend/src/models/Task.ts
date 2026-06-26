import mongoose, { Schema } from 'mongoose';
import { ITask } from '../types';

const taskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    tags: [{ type: String, trim: true }],
    category: { type: String, trim: true },
    dueDate: { type: Date },
    reminder: { type: Date },
    recurrence: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'none',
    },
    recurrenceEndDate: { type: Date },
    kanbanOrder: { type: Number, default: 0 },
    scheduledStart: { type: Date },
    scheduledEnd: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ userId: 1, tags: 1 });
taskSchema.index({ title: 'text', description: 'text' });
taskSchema.index({ userId: 1, scheduledStart: 1, scheduledEnd: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
