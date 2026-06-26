import mongoose, { Schema } from 'mongoose';
import { ISubject } from '../types';

const subjectSchema = new Schema<ISubject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    color: { type: String, default: '#8b5cf6' },
    description: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

subjectSchema.index({ userId: 1, name: 1 });

export const Subject = mongoose.model<ISubject>('Subject', subjectSchema);
