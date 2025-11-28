import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { families, users } from "../db/schema";
import { AppError } from "../utils/AppError";
import { uploadToCloudinary } from "../utils/cloudinary";
import { v4 as uuidv4 } from "uuid";

export class FamilyService {
  async createFamily(userId: number, name: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user.familyId) {
      throw new AppError("User is already in a family", 400);
    }

    const inviteCode = uuidv4().substring(0, 10);

    const [newFamily] = await db
      .insert(families)
      .values({
        name,
        adminId: userId,
        inviteCode,
      })
      .$returningId();

    await db
      .update(users)
      .set({ familyId: newFamily.id })
      .where(eq(users.id, userId));

    return {
      id: newFamily.id,
      name,
      inviteCode,
      adminId: userId,
    };
  }

  async joinFamily(userId: number, inviteCode: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user.familyId) {
      throw new AppError("User is already in a family", 400);
    }

    const [family] = await db
      .select()
      .from(families)
      .where(eq(families.inviteCode, inviteCode));

    if (!family) {
      throw new AppError("Invalid invite code", 404);
    }

    await db
      .update(users)
      .set({ familyId: family.id })
      .where(eq(users.id, userId));

    return family;
  }

  async getFamilyMembers(familyId: number) {
    const members = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        isAdmin: eq(users.id, families.adminId),
      })
      .from(users)
      .leftJoin(families, eq(users.familyId, families.id))
      .where(eq(users.familyId, familyId));

    return members;
  }

  async updateFamilyProfile(
    userId: number,
    familyId: number,
    data: { name?: string },
    file?: Express.Multer.File,
  ) {
    const [family] = await db
      .select()
      .from(families)
      .where(eq(families.id, familyId));

    if (!family) {
      throw new AppError("Family not found", 404);
    }

    if (family.adminId !== userId) {
      throw new AppError("Only admin can update family profile", 403);
    }

    let updateData: any = {};

    if (data.name) {
      updateData.name = data.name;
    }

    if (file) {
      const uploadResult = await uploadToCloudinary(file.buffer, "families");
      updateData.avatarUrl = uploadResult.secure_url;
    }

    if (Object.keys(updateData).length === 0) {
      return null;
    }

    await db.update(families).set(updateData).where(eq(families.id, familyId));

    const [updatedFamily] = await db
      .select()
      .from(families)
      .where(eq(families.id, familyId));

    return updatedFamily;
  }
}
