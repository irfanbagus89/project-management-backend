import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { JwtPayload } from 'src/auth/jwt.strategy';

export interface TenantRequest extends Request {
  user?: JwtPayload;
  tenant?: {
    orgId: string;
  };
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async use(req: TenantRequest, res: Response, next: NextFunction) {
    const cookies = (req.cookies ?? {}) as Record<string, string>;
    const token = cookies.access_token;
    if (!token) return next(); // public route skip

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.jwtSecret,
      });

      const member = await this.prisma.orgMember.findFirst({
        where: { userId: payload.userId, status: 'active' },
        select: { orgId: true },
      });

      if (!member) {
        throw new UnauthorizedException(
          'User tidak tergabung dalam organisasi manapun',
        );
      }

      req.user = payload;
      req.tenant = { orgId: member.orgId };

      return next();
    } catch {
      throw new UnauthorizedException(
        'Token tidak valid atau organisasi tidak ditemukan',
      );
    }
  }
}
