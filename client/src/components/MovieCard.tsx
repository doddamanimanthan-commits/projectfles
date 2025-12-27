import { Link } from "wouter";
import { type Movie } from "@shared/schema";
import { Play } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/watch/${movie.id}`} className="group relative block w-full aspect-[2/3] overflow-hidden rounded-md bg-zinc-900 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-black/50 hover:z-10 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      <img
        src={movie.posterUrl}
        alt={movie.title}
        className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-40"
        onError={(e) => {
          e.currentTarget.src = "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&auto=format&fit=crop&q=60"; // Fallback: Movie theater
        }}
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center mb-4 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <Play className="w-8 h-8 text-white fill-white ml-1" />
        </div>
        
        <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
          <h3 className="font-display text-2xl text-white drop-shadow-md leading-none mb-1">{movie.title}</h3>
          <p className="text-zinc-300 text-sm font-medium">{movie.releaseYear} • {movie.genre}</p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300">
        <h3 className="font-display text-xl text-white truncate">{movie.title}</h3>
      </div>
    </Link>
  );
}
