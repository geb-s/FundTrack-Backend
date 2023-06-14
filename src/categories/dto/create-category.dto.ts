import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';
import { TransactionCategoryType } from 'src/common/enums/transaction-category-type.enum';

@InputType()
export class CreateCategoryDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => TransactionCategoryType)
  @IsNotEmpty()
  @IsEnum(TransactionCategoryType, {
    message: 'Invalid transaction category type',
  })
  type: TransactionCategoryType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  userId?: number;
}
