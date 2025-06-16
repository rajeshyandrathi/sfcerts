
import { prisma } from './db';
import crypto from 'crypto';

export async function createDownloadLink(userId: string, productId: string): Promise<string> {
  // Create download record with 15-day expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 15);

  // Generate secure download URL
  const downloadToken = crypto.randomBytes(32).toString('hex');
  const downloadUrl = `/api/download/${downloadToken}`;

  await prisma.download.create({
    data: {
      userId,
      productId,
      downloadUrl,
      expiresAt,
      downloadCount: 0,
      maxDownloads: 10,
      isActive: true,
    }
  });

  return downloadUrl;
}

export async function getDownloadByToken(token: string) {
  return prisma.download.findFirst({
    where: {
      downloadUrl: `/api/download/${token}`,
      isActive: true,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      product: true,
      user: true
    }
  });
}

export async function incrementDownloadCount(downloadId: string) {
  const download = await prisma.download.findUnique({
    where: { id: downloadId }
  });

  if (!download) throw new Error('Download not found');

  const newCount = download.downloadCount + 1;
  
  // Deactivate if max downloads reached
  const isActive = newCount < download.maxDownloads;

  return prisma.download.update({
    where: { id: downloadId },
    data: {
      downloadCount: newCount,
      isActive
    }
  });
}

export async function getUserDownloads(userId: string) {
  return prisma.download.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          examName: true,
          examCode: true,
          price: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export function getRemainingDays(expiresAt: Date): number {
  const now = new Date();
  const diffTime = expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
