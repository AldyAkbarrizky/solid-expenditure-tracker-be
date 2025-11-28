import { describe, it, expect, vi, beforeEach } from "vitest";
import { FamilyService } from "../services/family.service";
import { db } from "../db";

vi.mock("../db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    $returningId: vi.fn(),
  },
}));

vi.mock("uuid", () => ({
  v4: () => "mock-uuid-1234",
}));

describe("FamilyService", () => {
  let familyService: FamilyService;

  beforeEach(() => {
    familyService = new FamilyService();
    vi.clearAllMocks();
  });

  describe("createFamily", () => {
    it("should create a family successfully", async () => {
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: 1, familyId: null }]),
        }),
      });

      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({
          $returningId: vi.fn().mockResolvedValue([{ id: 10 }]),
        }),
      });

      const result = await familyService.createFamily(1, "My Family");
      expect(result.name).toBe("My Family");
      expect(result.inviteCode).toBe("mock-uuid-");
    });

    it("should throw error if user already in family", async () => {
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: 1, familyId: 10 }]),
        }),
      });

      await expect(familyService.createFamily(1, "My Family")).rejects.toThrow(
        "User is already in a family",
      );
    });
  });
});
