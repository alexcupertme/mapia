import { AutoMap } from "@automapper/classes";

export enum BankAccountStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum Currency {
  USD = "USD",
  EUR = "EUR",
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

export class BankAccountEntity {
  @AutoMap()
  accountId!: string;

  @AutoMap()
  name!: string;

  @AutoMap()
  currency!: Currency;

  @AutoMap()
  status!: BankAccountStatus;

  @AutoMap()
  statistics!: BankAccountStatisticsEntity;
}