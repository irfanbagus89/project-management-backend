import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../config/config.service';

export interface JwtPayload {
  userId: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          const request = req as Request & { cookies?: Record<string, string> };
          return request.cookies?.access_token ?? null;
        }, // baca dari cookie jika ada
        ExtractJwt.fromAuthHeaderAsBearerToken(), // fallback ke header
      ]),
      secretOrKey: config.jwtSecret,
    });
  }

  validate(payload: JwtPayload) {
    return { userId: payload.userId, email: payload.email };
  }
}
