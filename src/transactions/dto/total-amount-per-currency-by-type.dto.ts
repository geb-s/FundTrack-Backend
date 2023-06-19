import { ObjectType, Field, Float } from '@nestjs/graphql';
import { TransactionCurrency } from 'src/common/enums/transaction-currency.enum';

@ObjectType()
export class TransactionTypeAmount {
  @Field()
  type: string;

  @Field(() => TransactionCurrency)
  currency: TransactionCurrency;

  @Field(() => Float)
  totalAmount: number;
}

@ObjectType()
export class TotalAmountPerCurrencyByTypeDto {
  @Field(() => [TransactionTypeAmount])
  transactionTypeAmount: TransactionTypeAmount[];
}
