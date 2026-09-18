import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, Role as PrismaRole } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createByAdmin(dto: AdminCreateUserDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('An account with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        address: dto.address.trim(),
        passwordHash,
        role: dto.role as PrismaRole,
      },
      select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
    });
  }

  async list(query: {
    name?: string;
    email?: string;
    address?: string;
    role?: PrismaRole;
    sortBy?: 'name' | 'email' | 'address' | 'role' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 10));

    // The admin UI sends an empty string when no role filter is selected.
    // Treat that the same as an omitted filter instead of passing an invalid
    // enum value to Prisma.
    const role = query.role || undefined;

    const where: Prisma.UserWhereInput = {
      ...(query.name ? { name: { contains: query.name, mode: 'insensitive' } } : {}),
      ...(query.email ? { email: { contains: query.email, mode: 'insensitive' } } : {}),
      ...(query.address ? { address: { contains: query.address, mode: 'insensitive' } } : {}),
      role: role ?? { in: ['ADMIN', 'USER'] },
    };

    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [query.sortBy ?? 'name']: query.sortOrder ?? 'asc',
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        ownedStore: { include: { _count: { select: { ratings: true } } } },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    let rating: number | null = null;
    if (user.ownedStore) {
      const aggregate = await this.prisma.rating.aggregate({
        where: { storeId: user.ownedStore.id },
        _avg: { value: true },
      });
      rating = aggregate._avg.value ?? null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
      store: user.ownedStore
        ? {
            id: user.ownedStore.id,
            name: user.ownedStore.name,
            address: user.ownedStore.address,
            rating,
            submittedRatings: user.ownedStore._count.ratings,
          }
        : null,
    };
  }
}
