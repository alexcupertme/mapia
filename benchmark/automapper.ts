import { classes } from "@automapper/classes";
import { Mapper, createMap, createMapper, forMember, mapFrom } from "@automapper/core";
import { BankAccountEntity, BankAccountResponse, BankAccountStatisticsEntity, BankStatsResponse } from "./entity";

export const mapper: Mapper = createMapper({
  strategyInitializer: classes(),
});

createMap(mapper, BankStatsResponse, BankAccountStatisticsEntity);

createMap(
  mapper,
  BankAccountResponse,
  BankAccountEntity,
  forMember(
    (dest) => dest.accountId,
    mapFrom((src) => src.id),
  ),
);