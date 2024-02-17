import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$default(nanoid),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  createdAtEpoch: integer("created_at_epoch", { mode: "timestamp" })
    .notNull()
    .default(sql`unixepoch()`),
  createdAtMode: integer("created_at_mode", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  createdAtInt: integer("created_at_int")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  createdAtText: text("created_at_text")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  int: integer("int").notNull().default(7),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SessionUser = Pick<User, "id" | "email">;
