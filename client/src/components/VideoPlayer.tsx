import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Maximize, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

export const VideoPlayer = ({ src, poster, title = "Now Playing" }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPaused(false);
    const handlePause = () => setIsPaused(true);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleError = () => setError("This video source is currently restricted or unavailable. Please try another source.");

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('error', handleError);
    };
  }, [src]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!isPaused) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play().catch(() => setError("Playback failed. Link might be restricted."));
      else videoRef.current.pause();
    }
  };

  const skip = (amount: number) => {
    if (videoRef.current) videoRef.current.currentTime += amount;
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) containerRef.current.requestFullscreen();
      else document.exitFullscreen();
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    // Prevent toggling if clicking controls
    if ((e.target as HTMLElement).closest('.controls-container')) return;
    togglePlay();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      skip(-10);
    } else {
      skip(10);
    }
  };

  const [lastTap, setLastTap] = useState(0);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.changedTouches[0];
      const x = touch.clientX - rect.left;
      if (x < rect.width / 2) {
        skip(-10);
      } else {
        skip(10);
      }
    } else {
      handleMouseMove();
    }
    setLastTap(now);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full group relative overflow-hidden bg-black flex items-center justify-center cursor-none"
      onMouseMove={handleMouseMove}
      onClick={handleVideoClick}
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full max-h-screen pointer-events-none"
        playsInline
      >
        Your browser does not support the video tag.
      </video>

      {/* Overlays */}
      <div className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-500 bg-gradient-to-t from-black/80 via-transparent to-black/60 z-10 ${showControls || isPaused ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Top Bar */}
        <div className="p-4 md:p-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); window.history.back(); }} className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-white text-lg md:text-2xl font-bold truncate drop-shadow-lg">{title}</h1>
        </div>

        {/* Center Play/Pause */}
        {isPaused && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-primary/90 text-white shadow-2xl transform transition-transform scale-100 hover:scale-110">
              <Play className="w-10 h-10 fill-current ml-1.5" />
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="controls-container p-4 md:p-8 space-y-4" onClick={(e) => e.stopPropagation()}>
          {/* Progress Slider */}
          <div className="flex items-center gap-4 group/slider">
            <span className="text-white text-sm font-medium w-12">{formatTime(currentTime)}</span>
            <Slider 
              value={[currentTime]} 
              max={duration || 100} 
              step={0.1}
              onValueChange={handleSeek}
              className="flex-1 cursor-pointer"
            />
            <span className="text-white text-sm font-medium w-12">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-6">
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="text-white hover:bg-white/20">
                {isPaused ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6 fill-current" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); skip(-10); }} className="text-white hover:bg-white/20">
                <RotateCcw className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); skip(10); }} className="text-white hover:bg-white/20">
                <RotateCw className="w-6 h-6" />
              </Button>
              <div className="flex items-center gap-2 group/volume">
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="text-white hover:bg-white/20">
                  {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </Button>
                <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                  <Slider 
                    value={[isMuted ? 0 : volume]} 
                    max={1} 
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-24 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="text-white hover:bg-white/20">
                <Maximize className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-30 p-6 text-center">
          <div className="max-w-md">
            <p className="text-white text-lg font-medium mb-6 leading-relaxed">{error}</p>
            <Button 
              className="px-8 py-2 bg-primary text-white font-bold hover:bg-primary/90 transition-all"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
