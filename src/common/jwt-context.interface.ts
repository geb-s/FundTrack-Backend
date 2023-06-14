import { GqlExecutionContext } from '@nestjs/graphql';

export interface JwtContext extends GqlExecutionContext {
  req: {
    user: {
      id: number;
    };
  };
}
