import { prisma } from "../../config/prisma";

export async function createNotificationService(input: { userId: string; title: string; body: string; type: string; link?: string; metadata?: Record<string, any> }) {
  return prisma.notification.create({ data: input });
}

export async function getUserNotificationsService(userId: string, unreadOnly = false) {
  return prisma.notification.findMany({ where: { userId, ...(unreadOnly ? { isRead: false } : {}) }, orderBy: { createdAt: "desc" }, take: 50 });
}

export async function markReadService(notificationId: string) {
  return prisma.notification.update({ where: { id: notificationId }, data: { isRead: true, readAt: new Date() } });
}

export async function markAllReadService(userId: string) {
  return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true, readAt: new Date() } });
}