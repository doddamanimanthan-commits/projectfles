import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export const VideoPlayer = ({ src, poster }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const handlePlay = () => setIsPaused(false);
      const handlePause = () => setIsPaused(true);
      const handleError = () => {
        setError("This video source is currently restricted or unavailable. Please try another source.");
      };

      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('error', handleError);
      };
    }
  }, [src]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {
          setError("Failed to play video. This link might be restricted.");
        });
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div className="w-full h-full group relative overflow-hidden bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        className="w-full h-full max-h-screen"
        playsInline
      >
        Your browser does not support the video tag.
      </video>
      
      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-30 p-6 text-center">
          <div className="max-w-md">
            <p className="text-white text-lg font-medium mb-6 leading-relaxed">{error}</p>
            <button 
              className="px-6 py-2 bg-primary text-white rounded-md font-bold hover:bg-primary/90 transition-all active:scale-95"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Play Button Overlay (Only before first play) */}
      {isPaused && !error && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer z-10"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-primary/90 text-white shadow-2xl">
            <Play className="w-10 h-10 fill-current ml-1.5" />
          </div>
        </div>
      )}
    </div>
  );
};
