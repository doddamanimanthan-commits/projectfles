import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertMovie, type Movie } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useMovies() {
  return useQuery({
    queryKey: [api.movies.list.path],
    queryFn: async () => {
      const res = await fetch(api.movies.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch movies");
      return api.movies.list.responses[200].parse(await res.json());
    },
  });
}

export function useMovie(id: number) {
  return useQuery({
    queryKey: [api.movies.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.movies.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) throw new Error("Movie not found");
      if (!res.ok) throw new Error("Failed to fetch movie");
      return api.movies.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateMovie() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertMovie) => {
      const validated = api.movies.create.input.parse(data);
      const res = await fetch(api.movies.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to create movie");
      }
      return api.movies.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.movies.list.path] });
      toast({ title: "Movie added", description: "The movie has been added to the catalog." });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateMovie() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertMovie>) => {
      const validated = api.movies.update.input.parse(updates);
      const url = buildUrl(api.movies.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Movie not found");
        throw new Error("Failed to update movie");
      }
      return api.movies.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.movies.list.path] });
      toast({ title: "Movie updated", description: "Your changes have been saved." });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteMovie() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.movies.delete.path, { id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete movie");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.movies.list.path] });
      toast({ title: "Movie deleted", description: "The movie has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    },
  });
}
