import { useAuth } from "@/hooks/use-auth";
import { useMovies, useDeleteMovie } from "@/hooks/use-movies";
import { Layout } from "@/components/Layout";
import { MovieDialog } from "@/components/MovieDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Edit, Trash2, Loader2, PlayCircle, Plus } from "lucide-react";
import { Movie } from "@shared/schema";

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: movies, isLoading: moviesLoading } = useMovies();
  const deleteMovie = useDeleteMovie();
  const [search, setSearch] = useState("");
  const [movieToDelete, setMovieToDelete] = useState<number | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  if (authLoading || !user) return null;

  const filteredMovies = movies?.filter(movie => 
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Content Management</h1>
            <p className="text-muted-foreground">Manage your movie library.</p>
          </div>
          <MovieDialog />
        </div>

        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-border bg-zinc-900/50 flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search movies..." 
                className="pl-9 bg-background border-zinc-800"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Total Movies: <span className="text-white font-medium">{movies?.length || 0}</span>
            </div>
          </div>

          {moviesLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-zinc-900/50 border-border">
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Genre</TableHead>
                    <TableHead className="hidden sm:table-cell">Year</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovies?.map((movie) => (
                    <TableRow key={movie.id} className="hover:bg-zinc-900/50 border-border">
                      <TableCell>
                        <div className="w-10 h-14 bg-zinc-800 rounded overflow-hidden">
                          <img 
                            src={movie.posterUrl} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/40x56?text=?"; }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        <div className="flex flex-col">
                          <span>{movie.title}</span>
                          <span className="text-xs text-muted-foreground md:hidden">{movie.releaseYear} • {movie.genre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-zinc-300">{movie.genre}</TableCell>
                      <TableCell className="hidden sm:table-cell text-zinc-300">{movie.releaseYear}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <MovieDialog 
                            movie={movie} 
                            trigger={
                              <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10">
                                <Edit className="w-4 h-4" />
                              </Button>
                            }
                          />
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-zinc-800">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Movie</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete <span className="text-white font-medium">{movie.title}</span>? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-zinc-700 hover:bg-zinc-800 hover:text-white">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteMovie.mutate(movie.id)}
                                  className="bg-destructive hover:bg-destructive/90 text-white"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredMovies?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                        No movies found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
