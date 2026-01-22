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

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.className = 'video-js vjs-big-play-centered vjs-theme-city';
      videoRef.current.appendChild(videoElement);

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
          src,
          type: src.includes('m3u8') ? 'application/x-mpegURL' : 'video/mp4'
        }],
        poster,
        userActions: {
          hotkeys: true
        }
      });

      player.on('play', () => setIsPaused(false));
      player.on('pause', () => setIsPaused(true));

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
      
      {/* Big Play Button Overlay */}
      {isPaused && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-10 transition-opacity"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-primary/80 hover:bg-primary text-white transition-all transform hover:scale-110">
            <Play className="w-10 h-10 fill-current ml-1" />
          </div>
        </div>
      )}
    </div>
  );
};
