import { type User, type InsertUser, type Movie, type InsertMovie } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie | undefined>;
  deleteMovie(id: number): Promise<void>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private movies: Map<number, Movie>;
  sessionStore: session.Store;
  currentUserId: number;
  currentMovieId: number;

  constructor() {
    this.users = new Map();
    this.movies = new Map();
    this.currentUserId = 1;
    this.currentMovieId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values());
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    return this.movies.get(id);
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const id = this.currentMovieId++;
    const movie: Movie = { 
      ...insertMovie, 
      id, 
      isSeries: insertMovie.isSeries ?? false,
      episodes: insertMovie.episodes || "" 
    };
    this.movies.set(id, movie);
    return movie;
  }

  async updateMovie(id: number, movieUpdate: Partial<InsertMovie>): Promise<Movie | undefined> {
    const existing = this.movies.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...movieUpdate };
    this.movies.set(id, updated);
    return updated;
  }

  async deleteMovie(id: number): Promise<void> {
    this.movies.delete(id);
  }
}

export const storage = new MemStorage();
