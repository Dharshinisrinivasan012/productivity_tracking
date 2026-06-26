import mongoose, { Schema } from 'mongoose';
import { IStudySession } from '../types';

const studySessionSchema = new Schema<IStudySession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    studyPlanId: { type: Schema.Types.ObjectId, ref: 'StudyPlan' },
    type: {
      type: String,
      enum: ['study', 'pomodoro', 'break'],
      default: 'study',
    },
    duration: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true, maxlength: 1000 },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

studySessionSchema.index({ userId: 1, startedAt: -1 });
studySessionSchema.index({ userId: 1, subjectId: 1 });
studySessionSchema.index({ userId: 1, type: 1 });

export const StudySession = mongoose.model<IStudySession>('StudySession', studySessionSchema);
