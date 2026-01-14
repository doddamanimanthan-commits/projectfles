import { useMovies } from "@/hooks/use-movies";
import { Layout } from "@/components/Layout";
import { MovieCard } from "@/components/MovieCard";
import { Input } from "@/components/ui/input";
import { Search, Film, Loader2 } from "lucide-react";
import { useState } from "react";
import { RequestModal } from "@/components/RequestModal";

export default function Home() {
  const { data: movies, isLoading, error } = useMovies();
  const [search, setSearch] = useState("");

  const filteredMovies = movies?.filter(movie => 
    movie.title.toLowerCase().includes(search.toLowerCase()) || 
    movie.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
              Featured Movies
            </h1>
            <p className="text-muted-foreground">Discover and stream the latest blockbusters.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <RequestModal />
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search titles, genres..." 
                className="pl-9 bg-zinc-900 border-zinc-800 focus:border-primary focus:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <Film className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground">Unable to load movies. Please try again later.</p>
          </div>
        ) : filteredMovies?.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8">
            <p className="text-lg text-muted-foreground">No movies found matching "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredMovies?.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
