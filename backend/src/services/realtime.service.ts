import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import { logger } from '../utils/logger';

let io: SocketServer | null = null;

export function initRealtime(httpServer: Server) {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true,
    },
    path: '/socket.io',
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('subscribe:site', (siteId: string) => {
      socket.join(`site:${siteId}`);
      logger.debug(`Socket ${socket.id} joined site:${siteId}`);
    });

    socket.on('unsubscribe:site', (siteId: string) => {
      socket.leave(`site:${siteId}`);
      logger.debug(`Socket ${socket.id} left site:${siteId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('✅ Socket.io initialized');
  return io;
}

export function emitEvent(siteId: string, event: any) {
  if (!io) {
    logger.warn('[emitEvent] io is null — Socket.io not initialized');
    return;
  }

  const room = `site:${siteId}`;
  const roomSize = io.sockets.adapter.rooms.get(room)?.size ?? 0;

  logger.info(
    `[emitEvent] Emitting to ${room} (${roomSize} clients) — event type: ${event.type}, path: ${event.path}`
  );

  io.to(room).emit('event', event);
}

export function getIO() {
  return io;
}