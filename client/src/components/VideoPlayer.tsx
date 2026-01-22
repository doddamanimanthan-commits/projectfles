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

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      setError(null);
      const videoElement = document.createElement("video-js");
      videoElement.className = 'video-js vjs-theme-city';
      videoRef.current.appendChild(videoElement);

      const isHLS = src.includes('m3u8');
      let customHeaders: Record<string, string> = {};
      let cleanSrc = src;

      try {
        const url = new URL(src);
        const headersParam = url.searchParams.get('headers');
        if (headersParam) {
          customHeaders = JSON.parse(decodeURIComponent(headersParam));
          // Remove headers param from the actual source URL used by videojs
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

      // Handle custom headers for proxy links using Video.js HTTP request hooks
      if (Object.keys(customHeaders).length > 0) {
        const vjs = videojs as any;
        // For HLS.js (vhs)
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
        // Small delay to ensure plugins are attached
        setTimeout(() => {
          try {
            const p = player as any;
            if (typeof p.hlsQualitySelector === 'function') {
              p.hlsQualitySelector({
                displayCurrentQuality: true,
              });
              console.log('Quality selector initialized');
            } else {
              console.warn('hlsQualitySelector plugin not found on player instance');
            }
          } catch (e) {
            console.error('Error initializing quality selector:', e);
          }
        }, 100);
      });

      // Keyboard shortcuts
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
          // Only toggle play if not typing in an input
          if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
            e.preventDefault();
            if (player.paused()) {
              player.play();
            } else {
              player.pause();
            }
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

  // Dispose the player on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

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
    <div data-vjs-player className="w-full h-full group relative">
      <div ref={videoRef} className="w-full h-full" />
      
      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 p-4 text-center">
          <div className="max-w-md">
            <p className="text-white text-lg font-medium mb-4">{error}</p>
            <div className="flex justify-center gap-4">
              <button 
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
      {isPaused && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-10 transition-opacity"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-primary/80 hover:bg-primary text-white transition-all transform hover:scale-110">
            <Play className="w-8 h-8 md:w-10 md:h-10 fill-current ml-1" />
          </div>
        </div>
      )}
    </div>
  );
};
