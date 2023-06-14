import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersModule } from './users/users.module';
import { UsersResolver } from './users/users.resolver';
import { User } from './users/user.entity';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UsersService } from './users/users.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { AuthResolver } from './auth/auth.resolver';
import { TransactionsModule } from './transactions/transactions.module';
import { Transaction } from './transactions/transaction.entity';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/category.entity';
import { CategoriesService } from './categories/categories.service';
import { CategoriesResolver } from './categories/categories.resolver';
import { TransactionsResolver } from './transactions/transactions.resolver';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'toor',
      database: 'financemanagementdb',
      entities: [User, Transaction, Category],
      synchronize: true,
      autoLoadEntities: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), './src/schema.gql'),
      sortSchema: true,
    }),
    UsersModule,
    AuthModule,
    TransactionsModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UsersResolver,
    UsersService,
    CategoriesService,
    CategoriesResolver,
    TransactionsModule,
    TransactionsResolver,
    AuthResolver,
    AuthService,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
