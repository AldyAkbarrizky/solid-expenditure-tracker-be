import { describe, it, expect, vi, beforeEach } from "vitest";
import { TransactionService } from "../services/transaction.service";
import { db } from "../db";

vi.mock("../db", () => ({
  db: {
    transaction: vi.fn((cb) => cb({
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        $returningId: vi.fn().mockResolvedValue([{ id: 100 }]),
    })),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  },
}));

describe("TransactionService", () => {
  let transactionService: TransactionService;

  beforeEach(() => {
    transactionService = new TransactionService();
    vi.clearAllMocks();
  });

  describe("createTransaction", () => {
    it("should create transaction successfully", async () => {
       const mockTx = {
           totalAmount: 50000,
           type: "MANUAL",
           items: [{ name: "Item 1", price: 50000, qty: 1 }]
       };

       const result = await transactionService.createTransaction(1, mockTx as any);
       expect(result.id).toBe(100);
    });
  });
});
