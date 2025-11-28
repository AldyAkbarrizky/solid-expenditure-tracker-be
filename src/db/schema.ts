import {
  mysqlTable,
  int,
  varchar,
  decimal,
  timestamp,
  mysqlEnum,
  text,
  index,
  boolean as boolMode,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";

export const families = mysqlTable("families", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  adminId: int("admin_id").notNull(),
  avatarUrl: text("avatar_url"),
  inviteCode: varchar("invite_code", { length: 10 }).notNull().unique(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(
    sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
  ),
});

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  familyId: int("family_id").references(() => families.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(
    sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
  ),
});

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),

  name: varchar("name", { length: 100 }).notNull().unique(),

  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 7 }).default("#808080"),

  isDefault: boolMode("is_default").default(false),

  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const transactions = mysqlTable(
  "transactions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id),
    totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
    transactionDate: timestamp("transaction_date").default(
      sql`CURRENT_TIMESTAMP`,
    ),
    type: mysqlEnum("type", ["RECEIPT", "QRIS", "MANUAL"]).notNull(),
    imageUrl: text("image_url"),
    rawOcrText: text("raw_ocr_text"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    dateIdx: index("date_idx").on(table.transactionDate),
  }),
);

export const transactionItems = mysqlTable("transaction_items", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: int("transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),

  categoryId: int("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),

  name: varchar("name", { length: 255 }).notNull(),
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  qty: int("qty").default(1),
});

export const familiesRelations = relations(families, ({ one, many }) => ({
  admin: one(users, {
    fields: [families.adminId],
    references: [users.id],
  }),
  members: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  transactions: many(transactions),
  family: one(families, {
    fields: [users.familyId],
    references: [families.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  items: many(transactionItems),
}));

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [transactions.userId],
      references: [users.id],
    }),
    items: many(transactionItems),
  }),
);

export const transactionItemsRelations = relations(
  transactionItems,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionItems.transactionId],
      references: [transactions.id],
    }),
    category: one(categories, {
      fields: [transactionItems.categoryId],
      references: [categories.id],
    }),
  }),
);

export type User = typeof users.$inferSelect;
export type Family = typeof families.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type TransactionItem = typeof transactionItems.$inferSelect;
