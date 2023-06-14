import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Transaction } from '../transactions/transaction.entity';
import { User } from '../users/user.entity';
import { TransactionCategoryType } from 'src/common/enums/transaction-category-type.enum';

registerEnumType(TransactionCategoryType, {
  name: 'TransactionCategoryType',
});

@ObjectType()
@Entity()
export class Category {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => TransactionCategoryType)
  @Column({ type: 'enum', enum: TransactionCategoryType })
  type: TransactionCategoryType;

  @ManyToOne(() => User, (user) => user.categories)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];
}
