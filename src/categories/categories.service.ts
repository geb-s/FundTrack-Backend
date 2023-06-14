import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { TransactionCategoryType } from 'src/common/enums/transaction-category-type.enum';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    const user = await this.usersService.findUserById(createCategoryDto.userId);
    if (!user) {
      throw new NotFoundException('User was not found');
    }

    const existingCategory = await this.categoriesRepository.findOne({
      where: {
        name: createCategoryDto.name,
        type: createCategoryDto.type,
        user: { id: createCategoryDto.userId },
      },
    });

    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }

    const category = this.categoriesRepository.create(createCategoryDto);
    category.user = user;
    return await this.categoriesRepository.save(category);
  }
  async updateCategory(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findCategoryById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }
  async findCategoryById(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async findCategoriesByUserId(userId: number): Promise<Category[]> {
    const categories = await this.categoriesRepository.find({
      where: { user: { id: userId } },
    });
    return categories;
  }

  async findCategoryByIdAndUserId(
    categoryId: number,
    userId: number,
  ): Promise<Category> {
    const categories = await this.categoriesRepository.find({
      where: { id: categoryId, user: { id: userId } },
    });
    if (categories.length === 0) {
      throw new NotFoundException('Category was not found');
    }
    return categories[0];
  }

  async deleteCategory(id: number): Promise<void> {
    const deleteResult = await this.categoriesRepository.delete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  async isCategoryForUser(
    userId: number,
    categoryId: number,
  ): Promise<boolean> {
    const categories = await this.categoriesRepository.find({
      where: { id: categoryId, user: { id: userId } },
    });
    return categories.length > 0;
  }

  async createDefaultCategoriesForUser(user: User): Promise<Category[]> {
    const userId = user.id;
    const defaultIncomeCategories: CreateCategoryDto[] = [
      {
        name: 'Salary',
        type: TransactionCategoryType.INCOME,
        userId,
      },
      {
        name: 'Freelance Income',
        type: TransactionCategoryType.INCOME,
        userId,
      },
      {
        name: 'Investments',
        type: TransactionCategoryType.INCOME,
        userId,
      },
      {
        name: 'Rental Income',
        type: TransactionCategoryType.INCOME,
        userId,
      },
      {
        name: 'Gift Income',
        type: TransactionCategoryType.INCOME,
        userId,
      },
    ];

    const defaultExpenseCategories: CreateCategoryDto[] = [
      {
        name: 'Rent/Mortgage',
        type: TransactionCategoryType.EXPENSE,
        userId,
      },
      {
        name: 'Utilities',
        type: TransactionCategoryType.EXPENSE,
        userId,
      },
      {
        name: 'Groceries',
        type: TransactionCategoryType.EXPENSE,
        userId,
      },
      {
        name: 'Transportation',
        type: TransactionCategoryType.EXPENSE,
        userId,
      },
      {
        name: 'Dining Out',
        type: TransactionCategoryType.EXPENSE,
        userId,
      },
      {
        name: 'Entertainment',
        type: TransactionCategoryType.EXPENSE,
        userId,
      },
      {
        name: 'Travel',
        type: TransactionCategoryType.EXPENSE,
        userId,
      },
      {
        name: 'Health Care',
        type: TransactionCategoryType.EXPENSE,
        userId,
      },
      {
        name: 'Education',
        type: TransactionCategoryType.EXPENSE,
        userId,
      },
      {
        name: 'Insurance',
        type: TransactionCategoryType.EXPENSE,
        userId,
      },
    ];

    const createdCategories: Category[] = [];

    const defaultCategoriesToCreate: CreateCategoryDto[] = [
      ...defaultIncomeCategories,
      ...defaultExpenseCategories,
    ];

    for (const defaultCategory of defaultCategoriesToCreate) {
      const category = this.categoriesRepository.create(defaultCategory);
      category.user = user;
      const createdCategory = await this.categoriesRepository.save(category);
      createdCategories.push(createdCategory);
    }

    return createdCategories;
  }
}
