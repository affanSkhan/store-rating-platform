import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { Role as PrismaRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { UsersService } from './users.service';

@Controller('admin/users')
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('address') address?: string,
    @Query('role') role?: Role,
    @Query('sortBy') sortBy?: 'name' | 'email' | 'address' | 'role' | 'createdAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
  ) {
    return this.usersService.list({ name, email, address, role: role as PrismaRole | undefined, sortBy, sortOrder, page, pageSize });
  }

  @Post()
  create(@Body() dto: AdminCreateUserDto) {
    return this.usersService.createByAdmin(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
