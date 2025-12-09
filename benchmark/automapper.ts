import { classes } from "@automapper/classes";
import {
  Mapper,
  createMap,
  createMapper,
  forMember,
  mapFrom,
} from "@automapper/core";
import {
  BankAccountEntity,
  BankAccountResponse,
  BankAccountStatisticsEntity,
  BankStatsResponse,
  ContactInfoEntity,
  ContactInfoResponse,
  TransactionEntity,
  TransactionResponse,
  Currency,
  NewCurrencyEnum,
  SimpleUserEntity,
  SimpleUserResponse,
} from "./entity";

export const mapper: Mapper = createMapper({
  strategyInitializer: classes(),
});

createMap(mapper, BankStatsResponse, BankAccountStatisticsEntity);

createMap(
  mapper,
  ContactInfoResponse,
  ContactInfoEntity,
  forMember(
    (dest) => dest.primaryEmail,
    mapFrom((src) => src.email),
  ),
);

createMap(
  mapper,
  SimpleUserResponse,
  SimpleUserEntity,
);

createMap(
  mapper,
  TransactionResponse,
  TransactionEntity,
  forMember(
    (dest) => dest.transactionId,
    mapFrom((src) => src.txId),
  ),
  forMember(
    (dest) => dest.amountCents,
    mapFrom((src) => Math.round(src.amount * 100)),
  ),
  forMember(
    (dest) => dest.timestamp,
    mapFrom((src) => new Date(src.timestamp)),
  ),
);

const currencyMap: Record<Currency, NewCurrencyEnum> = {
  [Currency.USD]: NewCurrencyEnum.USD_T,
  [Currency.EUR]: NewCurrencyEnum.EUR_T,
};

createMap(
  mapper,
  BankAccountResponse,
  BankAccountEntity,
  forMember(
    (dest) => dest.accountId,
    mapFrom((src) => src.id),
  ),
  forMember(
    (dest) => dest.currency,
    mapFrom((src) => currencyMap[src.currency]),
  ),
  forMember(
    (dest) => dest.createdAt,
    mapFrom((src) => new Date(src.createdAt)),
  ),
);
