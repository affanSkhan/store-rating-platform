import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RatingDto } from './dto/rating.dto';
import { RatingsService } from './ratings.service';

@Controller()
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post('ratings/:storeId')
  @Roles(Role.USER)
  createOrUpdate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId') storeId: string,
    @Body() dto: RatingDto,
  ) {
    return this.ratingsService.upsert(user.id, storeId, dto);
  }

  @Patch('ratings/:storeId')
  @Roles(Role.USER)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('storeId') storeId: string,
    @Body() dto: RatingDto,
  ) {
    return this.ratingsService.upsert(user.id, storeId, dto);
  }

  @Get('owner/dashboard')
  @Roles(Role.STORE_OWNER)
  dashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.ratingsService.ownerDashboard(user.id, { name, email, sortOrder });
  }
}
