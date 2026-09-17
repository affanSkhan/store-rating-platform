import { Test } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  it('issues a token after valid credentials', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'u1', name: 'Example Customer Account Holder', email: 'u@example.com', address: 'Pune', role: 'USER', passwordHash: 'hash',
        }),
      },
    };
    const jwt = { signAsync: jest.fn().mockResolvedValue('token') };
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    const service = moduleRef.get(AuthService);
    const result = await service.login({ email: 'u@example.com', password: 'User@123' });

    expect(result.accessToken).toBe('token');
    expect(jwt.signAsync).toHaveBeenCalled();
  });
});
