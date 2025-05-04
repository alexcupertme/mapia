import mapia, { rename } from '../src/mapia';
import { BankAccountEntity, BankAccountResponse } from "./entity";

export const bankMapper = mapia.compileMapper<BankAccountResponse, BankAccountEntity>({
  accountId: rename('id'),
  name: 'name',
  currency: 'currency',
  status: 'status',
  statistics: 'statistics'
});