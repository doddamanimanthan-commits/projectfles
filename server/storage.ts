import { createClient } from '@supabase/supabase-js';
import { type User, type InsertUser, type Movie, type InsertMovie } from "@shared/schema";

const supabaseUrl = 'https://xvxshavvleqbrhwqeoth.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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

export class SupabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    return data || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    return data || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([insertUser])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getMovies(): Promise<Movie[]> {
    const { data, error } = await supabase
      .from('movies')
      .select('*');
    if (error) throw error;
    return data || [];
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    const { data } = await supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .single();
    return data || undefined;
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const { data, error } = await supabase
      .from('movies')
      .insert([insertMovie])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateMovie(id: number, movieUpdate: Partial<InsertMovie>): Promise<Movie | undefined> {
    const { data, error } = await supabase
      .from('movies')
      .update(movieUpdate)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data || undefined;
  }

  async deleteMovie(id: number): Promise<void> {
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}

export const storage = new SupabaseStorage();
