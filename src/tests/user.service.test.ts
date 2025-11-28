import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "../services/user.service";
import { db } from "../db";

vi.mock("../db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
}));

vi.mock("../utils/cloudinary", () => ({
  uploadToCloudinary: vi.fn().mockResolvedValue({ secure_url: "http://cloudinary.com/image.jpg" }),
}));

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    vi.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should return user if found", async () => {
      const mockUser = { id: 1, name: "Test", email: "test@test.com" };
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockUser]),
        }),
      });

      const result = await userService.getUserById(1);
      expect(result).toEqual(mockUser);
    });

    it("should throw error if user not found", async () => {
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      await expect(userService.getUserById(999)).rejects.toThrow("User not found");
    });
  });

  describe("updateProfile", () => {
    it("should update user profile", async () => {
      const mockUser = { id: 1, name: "Updated Name" };
      (db.update as any).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      });
      
      (db.select as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockUser]),
        }),
      });

      const result = await userService.updateProfile(1, { name: "Updated Name" });
      expect(result).toEqual(mockUser);
    });
  });
});
