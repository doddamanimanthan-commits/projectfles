import { z } from "zod";

export const usersSchema = z.object({
  id: z.number(),
  username: z.string().min(1),
  password: z.string().min(1),
});

export const moviesSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  description: z.string().min(1),
  posterUrl: z.string().min(1),
  videoUrl: z.string().min(1),
  genre: z.string().min(1),
  releaseYear: z.number(),
  isSeries: z.boolean().default(false),
  episodes: z.string().default(""),
});

export const insertUserSchema = usersSchema.omit({ id: true });
export const insertMovieSchema = moviesSchema.omit({ id: true });

export type User = z.infer<typeof usersSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Movie = z.infer<typeof moviesSchema>;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
