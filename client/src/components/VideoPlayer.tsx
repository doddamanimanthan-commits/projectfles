import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-quality-levels';
import 'videojs-hls-quality-selector';

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export const VideoPlayer = ({ src, poster }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-big-play-centered', 'vjs-theme-city');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: true,
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
        poster
      });

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
      player.autoplay(true);
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

  return (
    <div data-vjs-player className="w-full h-full group relative">
      <div ref={videoRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded text-xs text-white pointer-events-none z-10">
        Press 'F' for Fullscreen • Space to Play/Pause
      </div>
    </div>
  );
};
