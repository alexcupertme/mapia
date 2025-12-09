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
  SimpleUserEntity,
  SimpleUserResponse,
} from "./entity";
import { bankMapper, simpleUserMapper } from "./mapia";

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
  contactInfo: {
    phone: "+1-555-1234",
    email: "john@example.com",
  },
  tags: ["savings", "vip"],
  transactions: [
    {
      txId: "tx-1",
      amount: 42.15,
      timestamp: "2025-12-01T10:00:00.000Z",
    },
    {
      txId: "tx-2",
      amount: 218.5,
      timestamp: "2025-12-02T14:30:00.000Z",
    },
    {
      txId: "tx-3",
      amount: 5.99,
      timestamp: "2025-12-03T08:15:00.000Z",
    },
  ],
  createdAt: "2024-01-01T00:00:00.000Z",
};

const createBankResponses = (count: number): BankAccountResponse[] =>
  Array.from({ length: count }, (_, idx) => ({
    ...bankResponse,
    id: `bulk-${idx}`,
    name: `John Doe ${idx}`,
    currency: idx % 2 === 0 ? Currency.USD : Currency.EUR,
    status:
      idx % 3 === 0 ? BankAccountStatus.SUSPENDED : BankAccountStatus.ACTIVE,
    statistics: {
      totalBalance: 1000 + idx,
      totalTransactions: 10 + idx,
      totalDeposits: 500 + idx,
      totalWithdrawals: 200 + idx,
    },
    tags: [
      `tag-${idx}`,
      idx % 2 ? "vip" : "standard",
      "rewards",
    ],
    transactions: bankResponse.transactions.map((txn, txnIdx) => ({
      ...txn,
      txId: `${txn.txId}-${idx}`,
      amount: txn.amount + txnIdx + idx * 0.1,
      timestamp: new Date(
        Date.parse(txn.timestamp) + idx * 1000 * (txnIdx + 1),
      ).toISOString(),
    })),
    createdAt: new Date(
      Date.parse(bankResponse.createdAt) + idx * 86_400_000,
    ).toISOString(),
  }));

const simpleUser: SimpleUserResponse = {
  firstName: "Jane",
  lastName: "Sakura",
  email: "jane@example.com",
};

const largeResponses = createBankResponses(500);

const runAutoMapperBatch = () => {
  for (const response of largeResponses) {
    mapper.map(response, BankAccountResponse, BankAccountEntity);
  }
};

const runClassTransformerBatch = () => {
  for (const response of largeResponses) {
    plainToInstance(BankAccountEntity, response);
  }
};

suite
  .add("object mapping (simple);AutoMapper", {
    defer: false,
    fn() {
      mapper.map(simpleUser, SimpleUserResponse, SimpleUserEntity);
    },
  })
  .add("object mapping (simple);Mapia", {
    defer: false,
    fn() {
      simpleUserMapper.mapOne(simpleUser);
    },
  })
  .add("object mapping (simple);Class Transformer", {
    defer: false,
    fn() {
      plainToInstance(SimpleUserEntity, simpleUser);
    },
  })
  .add("object mapping (complex type);AutoMapper", {
    defer: false,
    fn() {
      mapper.map(bankResponse, BankAccountResponse, BankAccountEntity);
    },
  })
  .add("object mapping (complex type);Mapia", {
    defer: false,
    fn() {
      bankMapper.mapOne(bankResponse);
    },
  })
  .add("object mapping (complex type);Class Transformer", {
    defer: false,
    fn() {
      plainToInstance(BankAccountEntity, bankResponse);
    },
  })
  .add("object mapping (complex type, batch);AutoMapper", {
    defer: false,
    fn() {
      runAutoMapperBatch();
    },
  })
  .add("object mapping (complex type, batch);Mapia", {
    defer: false,
    fn() {
      bankMapper.mapMany(largeResponses);
    },
  })
  .add("object mapping (complex type, batch);Class Transformer", {
    defer: false,
    fn() {
      runClassTransformerBatch();
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
      "utf8",
    );

    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .run({ async: true });
