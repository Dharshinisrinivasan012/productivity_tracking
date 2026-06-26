import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { Notification } from '../models';
import { sendReminderEmail } from './email.service';

let io: SocketServer | null = null;

export const initSocket = (server: SocketServer): void => {
  io = server;

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret) as { userId: string };
      socket.data.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      socket.leave(`user:${userId}`);
    });
  });
};

export const emitNotification = (userId: string, notification: object): void => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
};

export const createAndEmitNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
  metadata?: Record<string, unknown>,
  sendEmail: boolean = false,
  userEmail?: string
): Promise<void> => {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    link,
    metadata,
  });

  emitNotification(userId, notification);

  if (sendEmail && userEmail) {
    await sendReminderEmail(userEmail, title, message);
  }
};
