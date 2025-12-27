import { useMovie } from "@/hooks/use-movies";
import { Layout } from "@/components/Layout";
import { useRoute, Link } from "wouter";
import { Loader2, ArrowLeft, Calendar, Tag, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Watch() {
  const [, params] = useRoute("/watch/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: movie, isLoading, error } = useMovie(id);

  if (isLoading) {
    return (
      <Layout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !movie) {
    return (
      <Layout>
        <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mb-6" />
          <h1 className="text-3xl font-display font-bold mb-4">Movie Not Found</h1>
          <p className="text-muted-foreground mb-8">The movie you are looking for does not exist or has been removed.</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Browse
        </Link>

        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          <video
            className="w-full h-full object-contain"
            controls
            autoPlay
            poster={movie.posterUrl}
            src={movie.videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Movie Info */}
        <div className="grid md:grid-cols-[1fr_300px] gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300 mb-6">
              <span className="flex items-center bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
                <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
                {movie.releaseYear}
              </span>
              <span className="flex items-center bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
                <Tag className="w-3.5 h-3.5 mr-2 text-primary" />
                {movie.genre}
              </span>
            </div>
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
              <h3 className="font-bold text-lg mb-2 text-white">Synopsis</h3>
              <p className="text-zinc-400 leading-relaxed">{movie.description}</p>
            </div>
          </div>

          <div className="space-y-6">
             <div className="aspect-[2/3] rounded-lg overflow-hidden border border-zinc-800 shadow-xl hidden md:block">
               <img 
                src={movie.posterUrl} 
                alt={movie.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&auto=format&fit=crop&q=60";
                }}
               />
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
