import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RatingDto } from './dto/rating.dto';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(userId: string, storeId: string, dto: RatingDto) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Store not found');

    return this.prisma.rating.upsert({
      where: { userId_storeId: { userId, storeId } },
      create: { userId, storeId, value: dto.value },
      update: { value: dto.value },
      select: { id: true, value: true, storeId: true, updatedAt: true },
    });
  }

  async ownerDashboard(ownerId: string, filters: { name?: string; email?: string; sortOrder?: 'asc' | 'desc' }) {
    const store = await this.prisma.store.findUnique({
      where: { ownerId },
      select: { id: true, name: true, address: true },
    });
    if (!store) throw new NotFoundException('No store is linked to this account');

    const average = await this.prisma.rating.aggregate({
      where: { storeId: store.id },
      _avg: { value: true },
      _count: { value: true },
    });

    const rows = await this.prisma.rating.findMany({
      where: {
        storeId: store.id,
        user: {
          ...(filters.name ? { name: { contains: filters.name, mode: 'insensitive' } } : {}),
          ...(filters.email ? { email: { contains: filters.email, mode: 'insensitive' } } : {}),
        },
      },
      orderBy: { updatedAt: filters.sortOrder ?? 'desc' },
      select: {
        id: true,
        value: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true, address: true } },
      },
    });

    return {
      store,
      averageRating: average._avg.value ?? null,
      totalRatings: average._count.value,
      ratings: rows,
    };
  }
}
