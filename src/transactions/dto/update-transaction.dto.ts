import {
  IsNumber,
  IsString,
  IsPositive,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { TransactionCurrency } from 'src/common/enums/transaction-currency.enum';

@InputType()
export class UpdateTransactionDto {
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive number' })
  amount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => TransactionCurrency, { nullable: true })
  @IsOptional()
  @IsEnum(TransactionCurrency, {
    message: 'Invalid transaction currency',
  })
  currency?: TransactionCurrency;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  date?: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Category ID must be a positive number' })
  categoryId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'User ID must be a positive number' })
  userId?: number;
}
