import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('dashboard')
  async dashboard() {
    const [totalUsers, totalStores, totalRatings, usersByRole] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.store.count(),
      this.prisma.rating.count(),
      this.prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    ]);

    return {
      totalUsers,
      totalStores,
      totalRatings,
      usersByRole: Object.values(Role).map((role) => ({
        role,
        count: usersByRole.find((entry) => entry.role === role)?._count._all ?? 0,
      })),
    };
  }
}
