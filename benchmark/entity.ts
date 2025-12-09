import { AutoMap } from "@automapper/classes";
import { Transform, Type } from "class-transformer";

export enum BankAccountStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum Currency {
  USD = "USD",
  EUR = "EUR",
}

export enum NewCurrencyEnum {
  USD_T = 'USD_T',
  EUR_T = "EUR_T"
}

export class ContactInfoResponse {
  @AutoMap()
  phone!: string;

  @AutoMap()
  email!: string;
}

export class TransactionResponse {
  @AutoMap()
  txId!: string;

  @AutoMap()
  amount!: number;

  @AutoMap()
  timestamp!: string;
}

export class BankStatsResponse {
  @AutoMap()
  totalBalance!: number;

  @AutoMap()
  totalTransactions!: number;

  @AutoMap()
  totalDeposits!: number;

  @AutoMap()
  totalWithdrawals!: number;
}

export class BankAccountResponse {
  @AutoMap()
  id!: string;

  @AutoMap()
  name!: string;

  @AutoMap()
  currency!: Currency;

  @AutoMap()
  status!: BankAccountStatus;

  @AutoMap()
  statistics!: BankStatsResponse;

  @AutoMap()
  contactInfo!: ContactInfoResponse;

  @AutoMap()
  tags!: string[];

  @AutoMap()
  transactions!: TransactionResponse[];

  @AutoMap()
  createdAt!: string;
}

export class BankAccountStatisticsEntity {
  @AutoMap()
  totalBalance!: number;

  @AutoMap()
  totalTransactions!: number;

  @AutoMap()
  totalDeposits!: number;

  @AutoMap()
  totalWithdrawals!: number;
}

export class ContactInfoEntity {
  @AutoMap()
  phone!: string;

  @AutoMap()
  @Transform(({ obj }) => obj.email, { toClassOnly: true })
  primaryEmail!: string;
}

export class TransactionEntity {
  @AutoMap()
  transactionId!: string;

  @AutoMap()
  @Transform(({ obj }) => Math.round(obj.amount * 100), { toClassOnly: true })
  amountCents!: number;

  @AutoMap()
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  timestamp!: Date;
}

export class BankAccountEntity {
  @AutoMap()
  accountId!: string;

  @AutoMap()
  name!: string;

  @AutoMap()
  @Transform(
    ({ value }) =>
      value === Currency.USD ? NewCurrencyEnum.USD_T : NewCurrencyEnum.EUR_T,
    { toClassOnly: true },
  )
  currency!: NewCurrencyEnum;

  @AutoMap()
  status!: BankAccountStatus;

  @AutoMap()
  statistics!: BankAccountStatisticsEntity;

  @AutoMap(() => ContactInfoEntity)
  @Type(() => ContactInfoEntity)
  contactInfo!: ContactInfoEntity;

  @AutoMap()
  tags!: string[];

  @AutoMap(() => TransactionEntity)
  @Type(() => TransactionEntity)
  transactions!: TransactionEntity[];

  @AutoMap()
  @Transform(({ value }) => new Date(value), { toClassOnly: true })
  createdAt!: Date;
}

export class SimpleUserResponse {
  @AutoMap()
  firstName!: string;

  @AutoMap()
  lastName!: string;

  @AutoMap()
  email!: string;
}

export class SimpleUserEntity {
  @AutoMap()
  firstName!: string;

  @AutoMap()
  lastName!: string;

  @AutoMap()
  email!: string;
}
