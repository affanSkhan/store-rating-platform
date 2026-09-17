import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role as PrismaRole } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStoreDto) {
    if (dto.ownerId) {
      const owner = await this.prisma.user.findUnique({ where: { id: dto.ownerId } });
      if (!owner || owner.role !== PrismaRole.STORE_OWNER) {
        throw new BadRequestException('The selected owner must have the STORE_OWNER role');
      }
      const existingStore = await this.prisma.store.findUnique({ where: { ownerId: dto.ownerId } });
      if (existingStore) throw new BadRequestException('This store owner already owns a store');
    }

    return this.prisma.store.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        address: dto.address.trim(),
        ownerId: dto.ownerId,
      },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
  }

  async list(query: {
    name?: string;
    email?: string;
    address?: string;
    sortBy?: 'name' | 'email' | 'address' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 10));
    const where: Prisma.StoreWhereInput = {
      ...(query.name ? { name: { contains: query.name, mode: 'insensitive' } } : {}),
      ...(query.email ? { email: { contains: query.email, mode: 'insensitive' } } : {}),
      ...(query.address ? { address: { contains: query.address, mode: 'insensitive' } } : {}),
    };
    const orderBy: Prisma.StoreOrderByWithRelationInput = {
      [query.sortBy ?? 'name']: query.sortOrder ?? 'asc',
    };

    const [stores, total] = await this.prisma.$transaction([
      this.prisma.store.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { owner: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.store.count({ where }),
    ]);

    const items = await Promise.all(
      stores.map(async (store) => {
        const aggregate = await this.prisma.rating.aggregate({
          where: { storeId: store.id },
          _avg: { value: true },
        });
        return { ...store, rating: aggregate._avg.value ?? null };
      }),
    );

    return { items, pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } };
  }

  async publicList(query: { name?: string; address?: string; sortBy?: 'name' | 'address'; sortOrder?: 'asc' | 'desc'; userId: string }) {
    const stores = await this.prisma.store.findMany({
      where: {
        ...(query.name ? { name: { contains: query.name, mode: 'insensitive' } } : {}),
        ...(query.address ? { address: { contains: query.address, mode: 'insensitive' } } : {}),
      },
      orderBy: { [query.sortBy ?? 'name']: query.sortOrder ?? 'asc' },
    });

    return Promise.all(
      stores.map(async (store) => {
        const [aggregate, myRating] = await Promise.all([
          this.prisma.rating.aggregate({ where: { storeId: store.id }, _avg: { value: true } }),
          this.prisma.rating.findUnique({
            where: { userId_storeId: { userId: query.userId, storeId: store.id } },
            select: { value: true, updatedAt: true },
          }),
        ]);
        return {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          rating: aggregate._avg.value ?? null,
          myRating: myRating?.value ?? null,
        };
      }),
    );
  }

  async findByOwner(ownerId: string) {
    const store = await this.prisma.store.findUnique({ where: { ownerId } });
    if (!store) throw new NotFoundException('No store is linked to this account');
    return store;
  }
}
