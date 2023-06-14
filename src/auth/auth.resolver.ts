import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from 'src/users/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { LoginInput } from './dto/login.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation((returns) => String)
  async login(@Args('input') input: LoginInput): Promise<string> {
    const { email, password } = input;
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const token = await this.authService.generateToken(user);
    return token;
  }
}
