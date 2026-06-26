import { Response } from 'express';
import { Notification } from '../models';
import { AuthRequest } from '../types';
import { AppError, sendSuccess, asyncHandler } from '../utils/helpers';
import { emitNotification } from '../services/notification.service';

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', unreadOnly } = req.query;
  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, unknown> = { userId: req.userId };
  if (unreadOnly === 'true') filter.read = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.userId, read: false }),
  ]);

  res.json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { read: true },
    { new: true }
  );
  if (!notification) throw new AppError('Notification not found', 404);
  
  // Emit notification update to client
  emitNotification(req.userId!, { type: 'notification_read', notificationId: notification._id });
  
  sendSuccess(res, notification);
});

export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
  
  // Emit notification update to client
  emitNotification(req.userId!, { type: 'all_notifications_read' });
  
  sendSuccess(res, undefined, 'All notifications marked as read');
});

export const deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!notification) throw new AppError('Notification not found', 404);
  
  // Emit notification update to client
  emitNotification(req.userId!, { type: 'notification_deleted', notificationId: req.params.id });
  
  sendSuccess(res, undefined, 'Notification deleted');
});
