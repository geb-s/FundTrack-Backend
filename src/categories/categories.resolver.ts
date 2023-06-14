import {
  NotFoundException,
  UseGuards,
  ValidationPipe,
  UsePipes,
  ConflictException,
} from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtContext } from 'src/common/jwt-context.interface';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './category.entity';

@UseGuards(JwtAuthGuard)
@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private categoriesService: CategoriesService) {}

  @Query(() => Category, { nullable: true })
  async getCategoryById(
    @Args('categoryId', { type: () => Int }) id: number,
  ): Promise<Category> {
    const category = await this.categoriesService.findCategoryById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  @Query(() => [Category])
  async getCategoriesForUser(
    @Context() jwtContext: JwtContext,
  ): Promise<Category[]> {
    const userId = jwtContext.req.user.id;
    const categories = await this.categoriesService.findCategoriesByUserId(
      userId,
    );
    return categories;
  }

  @Mutation(() => Category)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createCategory(
    @Args('input') createCategoryDto: CreateCategoryDto,
    @Context() jwtContext: JwtContext,
  ): Promise<Category> {
    const userId = jwtContext.req.user.id;
    createCategoryDto.userId = userId;
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Mutation(() => Category)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateCategory(
    @Args('categoryId', { type: () => Int }) id: number,
    @Args('input') updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.updateCategory(id, updateCategoryDto);
  }

  @Mutation(() => Category)
  async removeCategory(
    @Args('categoryId', { type: () => Int }) id: number,
    @Context() jwtContext: JwtContext,
  ): Promise<Category> {
    const userId = jwtContext.req.user.id;
    const category = await this.categoriesService.findCategoryById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const isCategoryForUser = await this.categoriesService.isCategoryForUser(
      userId,
      id,
    );

    if (!isCategoryForUser) {
      throw new ConflictException('Invalid User');
    }
    await this.categoriesService.deleteCategory(id);
    return category;
  }
}
