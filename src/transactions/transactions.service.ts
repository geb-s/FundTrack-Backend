import {
  Injectable,
  NotFoundException,
  ConflictException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { UsersService } from 'src/users/users.service';
import { CategoriesService } from 'src/categories/categories.service';
import {
  TotalAmountPerCurrencyByTypeDto,
  TransactionTypeAmount,
} from './dto/total-amount-per-currency-by-type.dto';
import { Category } from 'src/categories/category.entity';
import { TransactionCategoryType } from 'src/common/enums/transaction-category-type.enum';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => CategoriesService))
    private categoriesService: CategoriesService,
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const user = await this.usersService.findUserById(
      createTransactionDto.userId,
    );
    if (!user) {
      throw new NotFoundException('User was not found');
    }

    const category = await this.categoriesService.findCategoryByIdAndUserId(
      createTransactionDto.categoryId,
      user.id,
    );

    const transaction =
      this.transactionsRepository.create(createTransactionDto);
    transaction.user = user;
    transaction.category = category;
    return this.transactionsRepository.save(transaction);
  }

  async updateTransaction(
    transactionId: number,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id: transactionId },
      relations: ['user', 'category'],
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // checking if the user is changed for the transaction
    if (transaction.user.id !== updateTransactionDto.userId) {
      throw new ConflictException('Invalid User');
    }

    const updatedTransaction = Object.assign(transaction, updateTransactionDto);

    // updating the category of the transaction
    if (updateTransactionDto.categoryId) {
      const category = await this.categoriesService.findCategoryById(
        updateTransactionDto.categoryId,
      );
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      transaction.category = category;
    }

    return await this.transactionsRepository.save(updatedTransaction);
  }

  async findTransactionById(id: number): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOneBy({ id });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async findTransactionsByUserId(userId: number): Promise<Transaction[]> {
    const transactions = await this.transactionsRepository.find({
      where: { user: { id: userId } },
      relations: { category: true },
    });
    return transactions;
  }

  async findMostRecentTransactions(userId: number): Promise<Transaction[]> {
    const transactions = await this.transactionsRepository.find({
      where: { user: { id: userId } },
      relations: { category: true },
      order: { date: 'DESC' },
      take: 5,
    });
    return transactions;
  }
  async getTotalAmountPerCurrencyByType(
    userId: number,
  ): Promise<TotalAmountPerCurrencyByTypeDto> {
    const transactions = await this.transactionsRepository.find({
      where: { user: { id: userId } },
      relations: { category: true },
    });

    const result: TotalAmountPerCurrencyByTypeDto = {
      transactionTypeAmount: [],
    };

    transactions.forEach((transaction: Transaction) => {
      const { currency, category, amount } = transaction;

      const typeAmount = result.transactionTypeAmount.find(
        (item) => item.currency === currency && item.type === category.type,
      );

      if (typeAmount) {
        typeAmount.totalAmount += amount;
      } else {
        result.transactionTypeAmount.push({
          type: category.type,
          currency,
          totalAmount: amount,
        });
      }
    });

    return result;
  }

  async getMostCommonCategories(
    userId: number,
    limit: number,
  ): Promise<Category[]> {
    const [incomeCategories, expenseCategories] = await Promise.all([
      this.getMostCommonCategoriesByType(
        userId,
        TransactionCategoryType.INCOME,
        limit,
      ),
      this.getMostCommonCategoriesByType(
        userId,
        TransactionCategoryType.EXPENSE,
        limit,
      ),
    ]);

    return [...incomeCategories, ...expenseCategories];
  }

  async getMostCommonCategoriesByType(
    userId: number,
    type: TransactionCategoryType,
    limit: number,
  ): Promise<Category[]> {
    const mostCommonCategories = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('transaction.category', 'category')
      .innerJoin('transaction.user', 'user')
      .where('category.type = :type', { type })
      .andWhere('user.id = :userId', { userId })
      .groupBy('category.id')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return mostCommonCategories.map((result) => {
      const newCategory = new Category();
      newCategory.id = result.categoryId;
      newCategory.name = result.categoryName;
      newCategory.type = type;

      return newCategory;
    });
  }

  async getTransactionsLastThreeMonths(userId: number): Promise<Transaction[]> {
    const currentDate = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

    const transactions = await this.transactionsRepository.find({
      where: {
        user: { id: userId },
        date: Between(threeMonthsAgo, currentDate),
      },
      relations: ['category'],
    });

    return transactions;
  }

  async deleteTransaction(id: number): Promise<void> {
    const deleteResult = await this.transactionsRepository.delete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException('Transaction not found');
    }
  }

  async isTransactionForUser(
    userId: number,
    transactionId: number,
  ): Promise<boolean> {
    const transactions = await this.transactionsRepository.find({
      where: { id: transactionId, user: { id: userId } },
    });
    return transactions.length > 0;
  }
}
