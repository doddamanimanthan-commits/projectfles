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
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-big-play-centered', 'vjs-theme-city');
      videoRef.current?.appendChild(videoElement);

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
      }, () => {
        console.log('player is ready');
        player.hlsQualitySelector({
          displayCurrentQuality: true,
        });
      });

      // Keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!player) return;
        
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
          e.preventDefault();
          if (player.paused()) {
            player.play();
          } else {
            player.pause();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      player.on('dispose', () => {
        window.removeEventListener('keydown', handleKeyDown);
      });

    } else {
      const player = playerRef.current;
      player.autoplay(true);
      player.src({ src, type: src.includes('m3u8') ? 'application/x-mpegURL' : 'video/mp4' });
    }
  }, [src, videoRef]);

  // Dispose the player on unmount
  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player className="w-full h-full group">
      <div ref={videoRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded text-xs text-white pointer-events-none">
        Press 'F' for Fullscreen • Space to Play/Pause
      </div>
    </div>
  );
};
