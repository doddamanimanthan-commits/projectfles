import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMovieSchema, type InsertMovie, type Movie } from "@shared/schema";
import { useCreateMovie, useUpdateMovie } from "@/hooks/use-movies";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { z } from "zod";

interface MovieDialogProps {
  movie?: Movie;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

interface Episode {
  title: string;
  url: string;
}

// Ensure numbers are coerced from strings for form inputs
const formSchema = insertMovieSchema.extend({
  releaseYear: z.coerce.number().min(1888).max(new Date().getFullYear() + 5),
  isSeries: z.boolean().default(false),
  episodes: z.string().default(""),
});

export function MovieDialog({ movie, trigger, open, onOpenChange }: MovieDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const show = isControlled ? open : internalOpen;
  const setShow = isControlled ? onOpenChange! : setInternalOpen;

  const createMovie = useCreateMovie();
  const updateMovie = useUpdateMovie();
  
  const isEditing = !!movie;
  const isPending = createMovie.isPending || updateMovie.isPending;

  const [episodes, setEpisodes] = useState<Episode[]>([]);

  const form = useForm<InsertMovie & { isSeries: boolean }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      posterUrl: "",
      videoUrl: "",
      genre: "",
      releaseYear: new Date().getFullYear(),
      isSeries: false,
      episodes: "",
    },
  });

  // Reset form when dialog opens/closes or movie changes
  useEffect(() => {
    if (show) {
      if (movie) {
        form.reset({
          title: movie.title,
          description: movie.description,
          posterUrl: movie.posterUrl,
          videoUrl: movie.videoUrl,
          genre: movie.genre,
          releaseYear: movie.releaseYear,
          isSeries: movie.isSeries,
          episodes: movie.episodes,
        });
        // Parse existing episodes
        if (movie.isSeries && movie.episodes) {
          try {
            const parsed = JSON.parse(movie.episodes);
            setEpisodes(parsed);
          } catch {
            setEpisodes([]);
          }
        } else {
          setEpisodes([]);
        }
      } else {
        form.reset({
          title: "",
          description: "",
          posterUrl: "",
          videoUrl: "",
          genre: "",
          releaseYear: new Date().getFullYear(),
          isSeries: false,
          episodes: "",
        });
        setEpisodes([]);
      }
    }
  }, [show, movie, form]);

  const addEpisode = () => {
    setEpisodes([...episodes, { title: "", url: "" }]);
  };

  const removeEpisode = (index: number) => {
    setEpisodes(episodes.filter((_, i) => i !== index));
  };

  const updateEpisode = (index: number, field: "title" | "url", value: string) => {
    const updated = [...episodes];
    updated[index] = { ...updated[index], [field]: value };
    setEpisodes(updated);
  };

  async function onSubmit(data: any) {
    try {
      const submitData = {
        ...data,
        episodes: data.isSeries && episodes.length > 0 ? JSON.stringify(episodes) : "",
      };
      if (isEditing) {
        await updateMovie.mutateAsync({ id: movie.id, ...submitData });
      } else {
        await createMovie.mutateAsync(submitData);
      }
      setShow(false);
    } catch (error) {
      // Error handled by hook
    }
  }

  return (
    <Dialog open={show} onOpenChange={setShow}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add Movie
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] bg-card border-zinc-800 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide">
            {isEditing ? "Edit Movie" : "Add New Movie"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update movie details below. Changes are saved immediately." 
              : "Enter the details for the new movie to add to the catalog."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Movie Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Inception" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <FormControl>
                        <Input placeholder="Sci-Fi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="releaseYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2010" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="posterUrl"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Poster Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Video Stream URL (YouTube/Drive/MP4/HLS)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isSeries"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between col-span-2 border border-zinc-700 p-3 rounded-lg bg-zinc-900/50">
                      <div className="flex flex-col space-y-1">
                        <FormLabel className="cursor-pointer">This is a TV Series</FormLabel>
                        <p className="text-sm text-muted-foreground">Enable to add multiple episode links</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("isSeries") && (
                  <div className="col-span-2 space-y-3 border border-zinc-700 p-4 rounded-lg bg-zinc-900/50">
                    <div className="flex items-center justify-between">
                      <FormLabel>Episodes</FormLabel>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={addEpisode}
                      >
                        <Plus className="w-3 h-3" /> Add Episode
                      </Button>
                    </div>

                    {episodes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No episodes added yet. Click "Add Episode" to get started.</p>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {episodes.map((episode, index) => (
                          <div key={index} className="flex gap-2 items-start">
                            <div className="flex-1 space-y-2">
                              <Input
                                placeholder={`Episode ${index + 1} Title`}
                                value={episode.title}
                                onChange={(e) => updateEpisode(index, "title", e.target.value)}
                                className="text-sm"
                              />
                              <Input
                                placeholder="Video URL (YouTube/Drive/MP4)"
                                value={episode.url}
                                onChange={(e) => updateEpisode(index, "url", e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="mt-1 text-destructive hover:bg-destructive/10"
                              onClick={() => removeEpisode(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A thief who steals corporate secrets through the use of dream-sharing technology..." 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-zinc-700">
          <Button type="button" variant="outline" onClick={() => setShow(false)}>Cancel</Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isPending} 
            className="bg-primary hover:bg-primary/90"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Movie"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
