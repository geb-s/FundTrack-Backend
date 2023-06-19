import {
  NotFoundException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtContext } from 'src/common/jwt-context.interface';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => [User])
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User, { nullable: true })
  async getUserById(
    @Args('userId', { type: () => Int }) id: number,
  ): Promise<User> {
    const user = await this.usersService.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User, { nullable: true })
  async getUser(@Context() jwtContext: JwtContext): Promise<User> {
    const userId = jwtContext.req.user.id;
    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  @Mutation(() => User)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(@Args('input') createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUser(
    @Args('input') updateUserDto: UpdateUserDto,
    @Context() jwtContext: JwtContext,
  ): Promise<User> {
    const userId = jwtContext.req.user.id;
    return this.usersService.updateUser(userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  async removeUser(
    @Args('userId', { type: () => Int }) id: number,
  ): Promise<User> {
    const user = await this.usersService.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.usersService.deleteUser(id);
    return user;
  }
}
