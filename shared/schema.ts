import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  posterUrl: text("poster_url").notNull(),
  videoUrl: text("video_url").notNull(),
  genre: text("genre").notNull(),
  releaseYear: integer("release_year").notNull(),
  isSeries: boolean("is_series").default(false).notNull(),
  episodes: text("episodes").default("").notNull(), // JSON array stored as string
});

export const insertUserSchema = createInsertSchema(users);
export const insertMovieSchema = createInsertSchema(movies).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
