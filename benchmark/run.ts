import Benchmark from "benchmark";
import { plainToInstance } from "class-transformer";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { mapper } from "./automapper";
import {
  BankAccountEntity,
  BankAccountResponse,
  BankAccountStatus,
  Currency,
} from "./entity";
import { bankMapper } from "./mapia";

const suite = new Benchmark.Suite();

const results: Array<{ name: string; hz: number }> = [];

const bankResponse: BankAccountResponse = {
  id: "1",
  name: "John Doe",
  currency: Currency.USD,
  status: BankAccountStatus.ACTIVE,
  statistics: {
    totalBalance: 1000,
    totalTransactions: 10,
    totalDeposits: 500,
    totalWithdrawals: 200,
  },
};

suite
  .add("AutoMapper", {
    defer: false,
    fn() {
      mapper.map(bankResponse, BankAccountResponse, BankAccountEntity);
    },
  })
  .add("Mapia", {
    defer: false,
    fn() {
      bankMapper.mapOne(bankResponse);
    },
  })
  .add("Class Transformer", {
    defer: false,
    fn() {
      plainToInstance(BankAccountEntity, bankResponse);
    },
  })
  .on("cycle", (e: Benchmark.Event) => {
    const target = e.target as any;
    results.push({ name: target.name, hz: target.hz });
    console.log(String(target));
  })
  .on("complete", function (this: Benchmark.Suite) {
    // after all tests, write out our results.json
    writeFileSync(
      resolve(__dirname, "./results.json"),
      JSON.stringify(results, null, 2),
      "utf8"
    );

    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .run({ async: true });
