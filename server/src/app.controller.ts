import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  root() {
    return {
      service: 'store-rating-platform-api',
      status: 'ok',
      health: '/api/health',
    };
  }

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'store-rating-platform-api' };
  }
}
