import {
  Injectable,
  NotFoundException,
  ConflictException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { UsersService } from 'src/users/users.service';
import { CategoriesService } from 'src/categories/categories.service';

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
