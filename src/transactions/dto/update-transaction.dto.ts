import {
  IsNumber,
  IsString,
  IsPositive,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { InputType, Field, Int, Float } from '@nestjs/graphql';

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

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
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
