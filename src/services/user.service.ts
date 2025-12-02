import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { uploadToCloudinary } from "../utils/cloudinary";
import { AppError } from "../utils/AppError";

export class UserService {
  async updateProfile(userId: number, data: { name?: string }, file?: Express.Multer.File) {
    let updateData: any = {};

    if (data.name) {
      updateData.name = data.name;
    }

    if (file) {
      console.log("Uploading file to Cloudinary...");
      const { secure_url } = await uploadToCloudinary(file.buffer, "avatars");
      console.log("Cloudinary Upload Success:", secure_url);
      updateData.avatarUrl = secure_url;
    } else {
      console.log("No file provided to service.");
    }

    if (Object.keys(updateData).length === 0) {
      return null;
    }

    await db.update(users).set(updateData).where(eq(users.id, userId));

    const [updatedUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        familyId: users.familyId,
      })
      .from(users)
      .where(eq(users.id, userId));

    return updatedUser;
  }

  async getUserById(userId: number) {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        familyId: users.familyId,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }
}
