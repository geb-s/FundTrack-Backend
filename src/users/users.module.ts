import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => CategoriesModule),
  ],
  exports: [TypeOrmModule, UsersService],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
