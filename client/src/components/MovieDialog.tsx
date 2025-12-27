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
import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { z } from "zod";

interface MovieDialogProps {
  movie?: Movie;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

// Ensure numbers are coerced from strings for form inputs
const formSchema = insertMovieSchema.extend({
  releaseYear: z.coerce.number().min(1888).max(new Date().getFullYear() + 5),
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

  const form = useForm<InsertMovie>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      posterUrl: "",
      videoUrl: "",
      genre: "",
      releaseYear: new Date().getFullYear(),
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
        });
      } else {
        form.reset({
          title: "",
          description: "",
          posterUrl: "",
          videoUrl: "",
          genre: "",
          releaseYear: new Date().getFullYear(),
        });
      }
    }
  }, [show, movie, form]);

  async function onSubmit(data: InsertMovie) {
    try {
      if (isEditing) {
        await updateMovie.mutateAsync({ id: movie.id, ...data });
      } else {
        await createMovie.mutateAsync(data);
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
      <DialogContent className="sm:max-w-[600px] bg-card border-zinc-800">
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
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                    <FormLabel>Video Stream URL (MP4/HLS)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A thief who steals corporate secrets through the use of dream-sharing technology..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShow(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Movie"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
