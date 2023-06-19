import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsPositive,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { TransactionCurrency } from 'src/common/enums/transaction-currency.enum';

@InputType()
export class CreateTransactionDto {
  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive number' })
  amount: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field(() => TransactionCurrency)
  @IsNotEmpty()
  @IsEnum(TransactionCurrency, {
    message: 'Invalid transaction currency',
  })
  currency?: TransactionCurrency;

  @Field()
  @IsNotEmpty()
  date: Date;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @IsPositive({ message: 'Category ID must be a positive number' })
  categoryId: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'User ID must be a positive number' })
  userId: number;
}
