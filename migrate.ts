import { migrate } from "drizzle-orm/mysql2/migrator";
import { db } from "./src/db";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function runMigration() {
  console.log("⏳ Starting migration...");

  // Create a separate connection for raw queries (to disable FK checks)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    // Disable Foreign Key Checks
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
    console.log("✅ Foreign Key Checks Disabled");

    // Run Drizzle Migration
    // Note: We need to pass the 'db' instance from src/db/index.ts
    // But migrate() expects the drizzle instance.
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("✅ Migration completed successfully");

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    // Re-enable Foreign Key Checks
    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("✅ Foreign Key Checks Enabled");
    
    await connection.end();
    process.exit(0);
  }
}

runMigration();
