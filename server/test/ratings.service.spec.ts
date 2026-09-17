import { Test } from '@nestjs/testing';
import { RatingsService } from '../src/ratings/ratings.service';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('RatingsService', () => {
  it('upserts a rating for a user/store pair', async () => {
    const prisma = {
      store: { findUnique: jest.fn().mockResolvedValue({ id: 'store-1' }) },
      rating: {
        upsert: jest.fn().mockResolvedValue({ id: 'rating-1', value: 4, storeId: 'store-1', updatedAt: new Date() }),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [RatingsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    const service = moduleRef.get(RatingsService);
    const result = await service.upsert('user-1', 'store-1', { value: 4 });

    expect(prisma.rating.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_storeId: { userId: 'user-1', storeId: 'store-1' } },
    }));
    expect(result.value).toBe(4);
  });
});
