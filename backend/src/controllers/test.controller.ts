import { Response } from 'express';
import { User } from '../models';
import { AuthRequest } from '../types';
import { sendSuccess, asyncHandler } from '../utils/helpers';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendReminderEmail,
  sendWeeklySummaryEmail,
} from '../services/email.service';

export const testEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { type = 'general' } = req.query;
  const user = await User.findById(req.userId);
  if (!user) throw new Error('User not found');

  console.log(`[Email Test] Testing email type: ${type} for user: ${user.email}`);

  let result: { success: boolean; message: string; details?: any };

  switch (type) {
    case 'verification':
      await sendVerificationEmail(user.email, 'test-token-123');
      result = {
        success: true,
        message: 'Email verification email sent successfully',
        details: { type: 'verification', email: user.email },
      };
      break;

    case 'password-reset':
      await sendPasswordResetEmail(user.email, 'test-token-456');
      result = {
        success: true,
        message: 'Password reset email sent successfully',
        details: { type: 'password-reset', email: user.email },
      };
      break;

    case 'task-reminder':
      await sendReminderEmail(user.email, 'Task Reminder', 'This is a test task reminder');
      result = {
        success: true,
        message: 'Task reminder email sent successfully',
        details: { type: 'task-reminder', email: user.email },
      };
      break;

    case 'study-reminder':
      await sendReminderEmail(user.email, 'Study Reminder', 'This is a test study reminder');
      result = {
        success: true,
        message: 'Study reminder email sent successfully',
        details: { type: 'study-reminder', email: user.email },
      };
      break;

    case 'weekly-summary':
      await sendWeeklySummaryEmail(user.email, {
        tasksCompleted: 15,
        habitsCompleted: 8,
        studyMinutes: 300,
      });
      result = {
        success: true,
        message: 'Weekly productivity summary email sent successfully',
        details: { type: 'weekly-summary', email: user.email },
      };
      break;

    default:
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Test Successful</h2>
          <p>This is a test email from PPMS.</p>
          <p>If you received this email, your email configuration is working correctly.</p>
          <p>Sent to: ${user.email}</p>
          <p>Sent at: ${new Date().toISOString()}</p>
        </div>
      `;
      
      // Import sendEmail directly for general test
      const { sendEmail } = await import('../services/email.service');
      const success = await sendEmail(user.email, 'PPMS Email Test', html);
      
      result = success
        ? {
            success: true,
            message: 'General test email sent successfully',
            details: { type: 'general', email: user.email },
          }
        : {
            success: false,
            message: 'Email credentials not configured - using mock mode',
            details: { type: 'general', email: user.email, mode: 'mock' },
          };
  }

  console.log(`[Email Test] Result:`, result);
  sendSuccess(res, result);
});
