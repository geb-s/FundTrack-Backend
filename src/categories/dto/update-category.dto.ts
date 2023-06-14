import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';
import { TransactionCategoryType } from 'src/common/enums/transaction-category-type.enum';

@InputType()
export class UpdateCategoryDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @Field(() => TransactionCategoryType, { nullable: true })
  @IsOptional()
  @IsEnum(TransactionCategoryType, {
    message: 'Invalid transaction category type',
  })
  type?: TransactionCategoryType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  userId?: number;
}
