import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config/config.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './interface/auth-response.interface';
import { BcryptUtil } from './bycrypt.utils';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(data: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) throw new ConflictException('Email sudah terdaftar');
    if (data.password.length < 8) {
      throw new BadRequestException('Password minimal 8 karakter');
    }
    const hash = await BcryptUtil.hashPassword(data.password);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: hash,
      },
    });

    return this.signToken(user.id, user.email, user.name);
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) throw new UnauthorizedException('Email tidak ditemukan');

    const valid = await BcryptUtil.comparePassword(
      data.password,
      user.passwordHash || '',
    );
    if (!valid) throw new UnauthorizedException('Password salah');

    return this.signToken(user.id, user.email, user.name);
  }

  async signToken(
    userId: string,
    email: string,
    name?: string,
  ): Promise<AuthResponse> {
    const payload = { userId: userId, email };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.config.jwtSecret,
      expiresIn: this.config.jwtExpiresIn,
    });

    return {
      access_token: token,
      expires_in: this.config.jwtExpiresIn,
      user: { email, name: name || '' },
    };
  }
}
