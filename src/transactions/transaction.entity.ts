import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '../users/user.entity';
import { Category } from 'src/categories/category.entity';
import { TransactionCurrency } from 'src/common/enums/transaction-currency.enum';

registerEnumType(TransactionCurrency, {
  name: 'TransactionCurrency',
});

@ObjectType()
@Entity()
export class Transaction {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  amount: number;

  @Field(() => TransactionCurrency)
  @Column({
    type: 'enum',
    enum: TransactionCurrency,
    default: TransactionCurrency.USD,
  })
  currency: TransactionCurrency;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  date: Date;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category, (category) => category.transactions)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
