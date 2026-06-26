import mongoose, { Schema } from 'mongoose';
import { IStudyPlan } from '../types';

const studyPlanSchema = new Schema<IStudyPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    topic: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    deadline: { type: Date },
    examDate: { type: Date },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
  },
  { timestamps: true }
);

studyPlanSchema.index({ userId: 1, subjectId: 1 });
studyPlanSchema.index({ userId: 1, deadline: 1 });
studyPlanSchema.index({ userId: 1, examDate: 1 });

export const StudyPlan = mongoose.model<IStudyPlan>('StudyPlan', studyPlanSchema);
