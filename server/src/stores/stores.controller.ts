import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateStoreDto } from './dto/create-store.dto';
import { StoresService } from './stores.service';

@Controller()
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get('stores')
  @Roles(Role.USER)
  listForUser(
    @CurrentUser() user: AuthenticatedUser,
    @Query('name') name?: string,
    @Query('address') address?: string,
    @Query('sortBy') sortBy?: 'name' | 'address',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.storesService.publicList({ name, address, sortBy, sortOrder, userId: user.id });
  }

  @Get('admin/stores')
  @Roles(Role.ADMIN)
  listForAdmin(
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('address') address?: string,
    @Query('sortBy') sortBy?: 'name' | 'email' | 'address' | 'createdAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.storesService.list({ name, email, address, sortBy, sortOrder });
  }

  @Post('admin/stores')
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateStoreDto) {
    return this.storesService.create(dto);
  }
}
