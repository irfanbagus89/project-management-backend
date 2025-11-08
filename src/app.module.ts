import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ProjectsModule } from './projects/project.module';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { JwtModule } from '@nestjs/jwt';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { LabelsModule } from './labels/label.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    ProjectsModule,
    JwtModule.register({}),
    TasksModule,
    CommentsModule,
    LabelsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
