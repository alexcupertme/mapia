import { rename, enumMapper, compileMapper, transform, transformWithRename, map } from '../src/index';
import {
  BankAccountEntity,
  BankAccountResponse,
  ContactInfoEntity,
  ContactInfoResponse,
  TransactionEntity,
  TransactionResponse,
  Currency,
  NewCurrencyEnum,
  SimpleUserEntity,
  SimpleUserResponse,
} from "./entity";

export const currencyMapper = enumMapper(Currency, NewCurrencyEnum, {
  USD: NewCurrencyEnum.USD_T,
  EUR: NewCurrencyEnum.EUR_T
}, '_T');

const contactInfoMapper = compileMapper<ContactInfoResponse, ContactInfoEntity>({
  phone: 'phone',
  primaryEmail: rename('email'),
});

const transactionMapper = compileMapper<TransactionResponse, TransactionEntity>({
  transactionId: rename('txId'),
  amountCents: transformWithRename((source) => Math.round(source.amount * 100)),
  timestamp: transformWithRename((source) => new Date(source.timestamp)),
});

export const simpleUserMapper = compileMapper<SimpleUserResponse, SimpleUserEntity>({
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
});

export const bankMapper = compileMapper<BankAccountResponse, BankAccountEntity>({
  accountId: rename('id'),
  name: 'name',
  currency: transform(currencyMapper.toDestination),
  status: 'status',
  statistics: 'statistics',
  contactInfo: map({
    phone: 'phone',
    primaryEmail: rename('email'),
  }),
  tags: 'tags',
  transactions: map({
    transactionId: rename('txId'),
    amountCents: transformWithRename((source) => Math.round(source.amount * 100)),
    timestamp: transformWithRename((source) => new Date(source.timestamp)),
  }),
  createdAt: transform((value) => new Date(value)),
});
