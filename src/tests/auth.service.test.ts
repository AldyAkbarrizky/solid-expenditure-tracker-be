import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../services/auth.service";
import { db } from "../db";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

vi.mock("../db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    $returningId: vi.fn(),
  },
}));

vi.mock("argon2");
vi.mock("jsonwebtoken");

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const mockUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]), // No existing user
        }),
      });

      (argon2.hash as any).mockResolvedValue("hashedPassword");

      (db.insert as any).mockReturnValue({
        values: vi.fn().mockReturnValue({
          $returningId: vi.fn().mockResolvedValue([{ id: 1 }]),
        }),
      });

      (jwt.sign as any).mockReturnValue("mockToken");

      const result = await authService.register(mockUser);

      expect(result).toHaveProperty("token", "mockToken");
      expect(result.user).toHaveProperty("email", mockUser.email);
    });

    it("should throw error if email already exists", async () => {
      const mockUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: 1, email: "test@example.com" }]),
        }),
      });

      await expect(authService.register(mockUser)).rejects.toThrow(
        "Email is already in use",
      );
    });
  });
});
