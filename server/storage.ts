import { users, movies, type User, type InsertUser, type Movie, type InsertMovie } from "@shared/schema";
import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const MOVIES_FILE = path.join(DATA_DIR, "movies.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: number, movie: Partial<InsertMovie>): Promise<Movie | undefined>;
  deleteMovie(id: number): Promise<void>;
}

export class FileStorage implements IStorage {
  private users: Map<number, User>;
  private movies: Map<number, Movie>;
  private userId: number;
  private movieId: number;

  constructor() {
    this.users = new Map();
    this.movies = new Map();
    this.userId = 1;
    this.movieId = 1;
    this.loadData();
  }

  private loadData() {
    try {
      if (fs.existsSync(USERS_FILE)) {
        const data = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
        data.forEach((user: User) => {
          this.users.set(user.id, user);
          if (user.id >= this.userId) this.userId = user.id + 1;
        });
      }
      if (fs.existsSync(MOVIES_FILE)) {
        const data = JSON.parse(fs.readFileSync(MOVIES_FILE, "utf-8"));
        data.forEach((movie: Movie) => {
          this.movies.set(movie.id, movie);
          if (movie.id >= this.movieId) this.movieId = movie.id + 1;
        });
      }
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(Array.from(this.users.values()), null, 2));
      fs.writeFileSync(MOVIES_FILE, JSON.stringify(Array.from(this.movies.values()), null, 2));
    } catch (err) {
      console.error("Error saving data:", err);
    }
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
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    this.saveData();
    return user;
  }

  async getMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values());
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    return this.movies.get(id);
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const id = this.movieId++;
    const movie: Movie = { ...insertMovie, id };
    this.movies.set(id, movie);
    this.saveData();
    return movie;
  }

  async updateMovie(id: number, movieUpdate: Partial<InsertMovie>): Promise<Movie | undefined> {
    const existing = this.movies.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...movieUpdate };
    this.movies.set(id, updated);
    this.saveData();
    return updated;
  }

  async deleteMovie(id: number): Promise<void> {
    this.movies.delete(id);
    this.saveData();
  }
}

export const storage = new FileStorage();
