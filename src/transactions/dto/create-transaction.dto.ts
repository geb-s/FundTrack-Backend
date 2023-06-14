import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsPositive,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { InputType, Field, Float, Int } from '@nestjs/graphql';

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

  @Field()
  @IsNotEmpty()
  @IsDateString()
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
