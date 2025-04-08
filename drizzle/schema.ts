// drizzle/schema.ts
import {
    pgTable,
    serial,
    text,
    varchar,
    timestamp,
    integer,
    primaryKey
  } from "drizzle-orm/pg-core";
  
  // Users table
  export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 100 }).unique().notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  });
  
  // One-to-many: Posts belong to a user
  export const posts = pgTable("posts", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull()
    .references(() => users.id, { onDelete: "cascade" }),  // 👈 this line

    title: text("title").notNull(),
    body: text("body"),
    createdAt: timestamp("created_at").defaultNow(),
  });
  
  // Many-to-many: Users ↔ Tags via user_tags
  export const tags = pgTable("tags", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).unique().notNull(),
  });
  
  export const userTags = pgTable("user_tags", {
    userId: integer("user_id").references(() => users.id).notNull(),
    tagId: integer("tag_id").references(() => tags.id).notNull(),
  }, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.tagId] }),
  }));
  