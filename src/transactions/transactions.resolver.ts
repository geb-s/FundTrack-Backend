import {
  ConflictException,
  NotFoundException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Context,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Transaction } from './transaction.entity';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtContext } from 'src/common/jwt-context.interface';
import { Category } from 'src/categories/category.entity';
import { TransactionCurrency } from 'src/common/enums/transaction-currency.enum';
import { TotalAmountPerCurrencyByTypeDto } from './dto/total-amount-per-currency-by-type.dto';

@UseGuards(JwtAuthGuard)
@Resolver(() => Transaction)
export class TransactionsResolver {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Query(() => Transaction, { nullable: true })
  async getTransactionById(
    @Args('transactionId', { type: () => Int }) id: number,
  ): Promise<Transaction> {
    const transaction = await this.transactionsService.findTransactionById(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  @Query(() => [Transaction])
  async getTransactionsForUser(
    @Context() jwtContext: JwtContext,
  ): Promise<Transaction[]> {
    const userId = jwtContext.req.user.id;
    const transactions =
      await this.transactionsService.findTransactionsByUserId(userId);
    return transactions;
  }

  @Query(() => [Transaction])
  async getMostRecentTransactions(
    @Context() jwtContext: JwtContext,
  ): Promise<Transaction[]> {
    const userId = jwtContext.req.user.id;
    const transactions =
      await this.transactionsService.findMostRecentTransactions(userId);
    return transactions;
  }

  @Query(() => [Transaction])
  async getTransactionsLastThreeMonths(
    @Context() jwtContext: JwtContext,
  ): Promise<Transaction[]> {
    const userId = jwtContext.req.user.id;
    const transactions =
      await this.transactionsService.getTransactionsLastThreeMonths(userId);
    return transactions;
  }

  @Query(() => TotalAmountPerCurrencyByTypeDto)
  async getTotalAmountPerCurrencyByType(
    @Context() jwtContext: JwtContext,
  ): Promise<TotalAmountPerCurrencyByTypeDto> {
    const userId = jwtContext.req.user.id;
    const totalAmountPerCurrencyByType =
      await this.transactionsService.getTotalAmountPerCurrencyByType(userId);
    return totalAmountPerCurrencyByType;
  }

  @Query(() => [Category])
  async getMostCommonCategories(
    @Context() jwtContext: JwtContext,
  ): Promise<Category[]> {
    const userId = jwtContext.req.user.id;
    const mostCommonCategories =
      await this.transactionsService.getMostCommonCategories(userId, 5);
    return mostCommonCategories;
  }

  @Mutation(() => Transaction)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTransaction(
    @Args('input') createTransactionDto: CreateTransactionDto,
    @Context() jwtContext: JwtContext,
  ): Promise<Transaction> {
    const userId = jwtContext.req.user.id;
    createTransactionDto.userId = userId;
    return this.transactionsService.createTransaction(createTransactionDto);
  }

  @Mutation(() => Transaction)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateTransaction(
    @Args('transactionId', { type: () => Int }) id: number,
    @Args('input') updateTransactionDto: UpdateTransactionDto,
    @Context() jwtContext: JwtContext,
  ): Promise<Transaction> {
    const userId = jwtContext.req.user.id;
    updateTransactionDto.userId = userId;
    if (updateTransactionDto.date) {
      updateTransactionDto.date = new Date(updateTransactionDto.date);
    }
    return this.transactionsService.updateTransaction(id, updateTransactionDto);
  }

  @Mutation(() => Transaction)
  async removeTransaction(
    @Args('transactionId', { type: () => Int }) id: number,
    @Context() jwtContext: JwtContext,
  ): Promise<Transaction> {
    const userId = jwtContext.req.user.id;
    const transaction = await this.transactionsService.findTransactionById(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    const isTransactionForUser =
      await this.transactionsService.isTransactionForUser(userId, id);

    if (!isTransactionForUser) {
      throw new ConflictException('Invalid User');
    }

    await this.transactionsService.deleteTransaction(id);
    return transaction;
  }

  @Query(() => [TransactionCurrency])
  async getCurrencies(): Promise<TransactionCurrency[]> {
    const enumValues = Object.keys(TransactionCurrency).map(
      (key) => TransactionCurrency[key],
    );
    return enumValues.filter(
      (value) => typeof value === 'string',
    ) as TransactionCurrency[];
  }

  @ResolveField(() => Category)
  async category(@Parent() transaction: Transaction): Promise<Category> {
    const { category } = transaction;
    return category ? category : null;
  }
}
