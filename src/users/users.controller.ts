import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { JwtPayload } from 'src/auth/jwt.strategy';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get all users (admin only)
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: QueryUserDto) {
    const data = this.usersService.findAll(query);
    return data;
  }

  // Get current user (self)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: AuthenticatedRequest) {
    const data = this.usersService.findById(req.user.userId);
    return data;
  }

  // Update profile
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(@Req() req: AuthenticatedRequest, @Body() data: UpdateUserDto) {
    return this.usersService.update(req.user.userId, data);
  }
}
