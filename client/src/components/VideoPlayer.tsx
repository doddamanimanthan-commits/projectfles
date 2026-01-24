import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-quality-levels';
import 'videojs-hls-quality-selector';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export const VideoPlayer = ({ src, poster }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      setError(null);
      const videoElement = document.createElement("video-js");
      videoElement.className = 'video-js vjs-theme-city vjs-big-play-centered';
      videoRef.current.appendChild(videoElement);

      const isHLS = src.includes('m3u8');
      let customHeaders: Record<string, string> = {};
      let cleanSrc = src;

      try {
        const url = new URL(src);
        const headersParam = url.searchParams.get('headers');
        if (headersParam) {
          customHeaders = JSON.parse(decodeURIComponent(headersParam));
          url.searchParams.delete('headers');
          cleanSrc = url.toString();
        }
      } catch (e) {
        console.warn('URL parsing failed:', e);
      }

      const player = playerRef.current = videojs(videoElement, {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        playbackRates: [0.5, 1, 1.5, 2],
        controlBar: {
          children: [
            'playToggle',
            'volumePanel',
            'currentTimeDisplay',
            'timeDivider',
            'durationDisplay',
            'progressControl',
            'playbackRateMenuButton',
            'subsCapsButton',
            'audioTrackButton',
            'fullscreenToggle',
          ],
        },
        sources: [{
          src: cleanSrc,
          type: isHLS ? 'application/x-mpegURL' : 'video/mp4'
        }],
        poster,
        userActions: {
          hotkeys: true
        }
      });

      player.on('error', () => {
        const err = player.error();
        if (err?.code === 4) {
          setError("This video source is currently restricted or unavailable. This often happens with third-party links that block direct access. Please try another episode or source.");
        }
      });

      player.on('play', () => setIsPaused(false));
      player.on('pause', () => setIsPaused(true));
      
      player.on('useractive', () => setShowControls(true));
      player.on('userinactive', () => setShowControls(false));

      // Handle custom headers for proxy links using Video.js HTTP request hooks
      if (Object.keys(customHeaders).length > 0) {
        const vjs = videojs as any;
        if (vjs.Vhs && vjs.Vhs.xhr) {
          const originalBeforeRequest = vjs.Vhs.xhr.beforeRequest;
          vjs.Vhs.xhr.beforeRequest = function(options: any) {
            options.headers = options.headers || {};
            Object.entries(customHeaders).forEach(([key, value]) => {
              options.headers[key] = value;
            });
            if (originalBeforeRequest) return originalBeforeRequest(options);
            return options;
          };
        }
      }

      player.ready(() => {
        console.log('player is ready');
        setTimeout(() => {
          try {
            const p = player as any;
            if (typeof p.hlsQualitySelector === 'function') {
              p.hlsQualitySelector({
                displayCurrentQuality: true,
              });
              console.log('Quality selector initialized');
            }
          } catch (e) {
            console.error('Error initializing quality selector:', e);
          }
        }, 100);
      });

      // Keyboard shortcuts and Double Tap to Seek
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!player || player.isDisposed()) return;
        
        const key = e.key.toLowerCase();
        if (key === 'f') {
          if (player.isFullscreen()) {
            player.exitFullscreen();
          } else {
            player.requestFullscreen();
          }
        } else if (key === 'escape' && player.isFullscreen()) {
          player.exitFullscreen();
        } else if (key === ' ') {
          if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
            e.preventDefault();
            if (player.paused()) {
              player.play();
            } else {
              player.pause();
            }
          }
        } else if (key === 'arrowright') {
          const current = player.currentTime();
          if (typeof current === 'number') {
            player.currentTime(current + 10);
          }
        } else if (key === 'arrowleft') {
          const current = player.currentTime();
          if (typeof current === 'number') {
            player.currentTime(current - 10);
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      player.on('dispose', () => {
        window.removeEventListener('keydown', handleKeyDown);
      });

    } else if (playerRef.current) {
      const player = playerRef.current;
      player.src({ src, type: src.includes('m3u8') ? 'application/x-mpegURL' : 'video/mp4' });
      player.autoplay(false);
    }
  }, [src]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!playerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      playerRef.current.currentTime(playerRef.current.currentTime() - 10);
    } else {
      playerRef.current.currentTime(playerRef.current.currentTime() + 10);
    }
  };

  const togglePlay = () => {
    if (playerRef.current) {
      if (playerRef.current.paused()) {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
    }
  };

  return (
    <div 
      data-vjs-player 
      className="w-full h-full group relative overflow-hidden bg-black"
      onDoubleClick={handleDoubleClick}
    >
      <div ref={videoRef} className="w-full h-full" />
      
      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-30 p-6 text-center animate-in fade-in duration-300">
          <div className="max-w-md">
            <p className="text-white text-lg font-medium mb-6 leading-relaxed">{error}</p>
            <div className="flex justify-center gap-4">
              <button 
                className="px-6 py-2 bg-primary text-white rounded-md font-bold hover:bg-primary/90 transition-all active:scale-95"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Play/Pause Center Overlay */}
      {isPaused && !error && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-10 transition-all duration-300"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-primary/90 hover:bg-primary text-white transition-all transform hover:scale-110 shadow-2xl shadow-primary/20">
            <Play className="w-10 h-10 md:w-12 md:h-12 fill-current ml-1.5" />
          </div>
        </div>
      )}

      {/* Title Overlay (Netflix Style) */}
      <div className={`absolute top-0 left-0 right-0 p-8 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 z-20 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-white text-xl md:text-2xl font-bold drop-shadow-lg">Now Playing</h1>
      </div>
    </div>
  );
};
