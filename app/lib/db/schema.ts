import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$default(nanoid),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SessionUser = Pick<User, "id" | "email">;

export const stores = sqliteTable("stores", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

export const storesRelations = relations(stores, ({ many }) => ({
  products: many(products),
}));

export const products = sqliteTable("products", {
  id: integer("id").primaryKey(),
  storeId: integer("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  price: integer("price").notNull(),
  priceFormatted: text("price_formatted").notNull(),
  buyNowUrl: text("buy_now_url").notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
  variants: many(variants),
}));

export const variants = sqliteTable("variants", {
  id: integer("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  sort: integer("sort").notNull(),
  status: text("status").notNull(),
});

export type Variant = typeof variants.$inferSelect;
export type InsertVariant = typeof variants.$inferInsert;

export const variantsRelations = relations(variants, ({ one, many }) => ({
  product: one(products, {
    fields: [variants.productId],
    references: [products.id],
  }),
  prices: many(prices),
}));

export const prices = sqliteTable("prices", {
  id: integer("id").primaryKey(),
  variantId: integer("variant_id")
    .notNull()
    .references(() => variants.id, { onDelete: "cascade" }),
  unitPrice: integer("unit_price").notNull(),
  renewalIntervalUnit: text("renewal_interval_unit").notNull(),
  renewalIntervalQuantity: integer("renewal_interval_quantity").notNull(),
});

export type Price = typeof prices.$inferSelect;
export type InsertPrice = typeof prices.$inferInsert;

export const pricesRelations = relations(prices, ({ one }) => ({
  variant: one(variants, {
    fields: [prices.variantId],
    references: [variants.id],
  }),
}));
