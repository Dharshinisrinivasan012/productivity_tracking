import http from 'http';
import { Server as SocketServer } from 'socket.io';
import app from './app';
import { config } from './config';
import { connectDB } from './config/database';
import { initSocket } from './services/notification.service';
import { startReminderScheduler } from './services/scheduler.service';

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  const io = new SocketServer(server, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  initSocket(io);
  startReminderScheduler();

  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });
};

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export { app, startServer };
