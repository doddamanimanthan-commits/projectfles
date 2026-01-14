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
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      return data || undefined;
    } catch (err) {
      console.error("Error fetching user:", err);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      return data || undefined;
    } catch (err) {
      console.error("Error fetching user by username:", err);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([insertUser])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getMovies(): Promise<Movie[]> {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*');
      if (error) throw error;
      
      // Map Supabase snake_case back to camelCase
      return (data || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        posterUrl: m.poster_url,
        videoUrl: m.video_url,
        genre: m.genre,
        releaseYear: m.release_year,
        isSeries: m.is_series,
        episodes: m.episodes
      }));
    } catch (err) {
      console.error("Error fetching movies:", err);
      return [];
    }
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    try {
      const { data } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();
      if (!data) return undefined;
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        posterUrl: data.poster_url,
        videoUrl: data.video_url,
        genre: data.genre,
        releaseYear: data.release_year,
        isSeries: data.is_series,
        episodes: data.episodes
      };
    } catch (err) {
      console.error("Error fetching movie:", err);
      return undefined;
    }
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    try {
      const supabaseMovie = {
        title: insertMovie.title,
        description: insertMovie.description,
        poster_url: insertMovie.posterUrl,
        video_url: insertMovie.videoUrl,
        genre: insertMovie.genre,
        release_year: insertMovie.releaseYear,
        is_series: insertMovie.isSeries,
        episodes: insertMovie.episodes
      };

      const { data, error } = await supabase
        .from('movies')
        .insert([supabaseMovie])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        posterUrl: data.poster_url,
        videoUrl: data.video_url,
        genre: data.genre,
        releaseYear: data.release_year,
        isSeries: data.is_series,
        episodes: data.episodes
      };
    } catch (error) {
      console.error("Error creating movie:", error);
      throw error;
    }
  }

  async updateMovie(id: number, movieUpdate: Partial<InsertMovie>): Promise<Movie | undefined> {
    try {
      const supabaseUpdate: any = {};
      if (movieUpdate.title !== undefined) supabaseUpdate.title = movieUpdate.title;
      if (movieUpdate.description !== undefined) supabaseUpdate.description = movieUpdate.description;
      if (movieUpdate.posterUrl !== undefined) supabaseUpdate.poster_url = movieUpdate.posterUrl;
      if (movieUpdate.videoUrl !== undefined) supabaseUpdate.video_url = movieUpdate.videoUrl;
      if (movieUpdate.genre !== undefined) supabaseUpdate.genre = movieUpdate.genre;
      if (movieUpdate.releaseYear !== undefined) supabaseUpdate.release_year = movieUpdate.releaseYear;
      if (movieUpdate.isSeries !== undefined) supabaseUpdate.is_series = movieUpdate.isSeries;
      if (movieUpdate.episodes !== undefined) supabaseUpdate.episodes = movieUpdate.episodes;

      const { data, error } = await supabase
        .from('movies')
        .update(supabaseUpdate)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) return undefined;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        posterUrl: data.poster_url,
        videoUrl: data.video_url,
        genre: data.genre,
        releaseYear: data.release_year,
        isSeries: data.is_series,
        episodes: data.episodes
      };
    } catch (err) {
      console.error("Error updating movie:", err);
      return undefined;
    }
  }

  async deleteMovie(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error("Error deleting movie:", err);
      throw err;
    }
  }
}

export const storage = new SupabaseStorage();
