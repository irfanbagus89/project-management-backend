import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config/config.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './interface/auth-response.interface';

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
    if (existingUser) throw new BadRequestException('Email sudah terdaftar');

    const hash = await bcrypt.hash(data.password, 10);
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

    const valid = await bcrypt.compare(data.password, user.passwordHash || '');
    if (!valid) throw new UnauthorizedException('Password salah');

    return this.signToken(user.id, user.email, user.name);
  }

  async signToken(
    userId: string,
    email: string,
    name?: string,
  ): Promise<AuthResponse> {
    const payload = { sub: userId, email };
    const token = (await this.jwtService.signAsync(payload, {
      secret: this.config.jwtSecret,
      expiresIn: this.config.jwtExpiresIn,
    })) as string;

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: this.config.jwtExpiresIn,
      user: { id: userId, email, name: name || '' },
    };
  }
}
