"use client";

import { useEffect, useRef, useState } from "react";
import { Video } from "lucide-react";
import { motion } from "framer-motion";
import type { Testimonial } from "@/lib/landing-content";

function playerSource(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let youtubeId: string | null = null;
    if (host === "youtu.be") youtubeId = url.pathname.split("/")[1];
    const isYouTube = ["youtu.be", "youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host);
    if (host !== "youtu.be" && isYouTube) {
      youtubeId = ["/shorts/", "/embed/", "/live/"].some((path) => url.pathname.startsWith(path))
        ? url.pathname.split("/")[2]
        : url.searchParams.get("v");
    }
    if (youtubeId && /^[\w-]{11}$/.test(youtubeId)) {
      return {
        kind: "embed" as const,
        url: `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`,
        thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
      };
    }
    if (isYouTube) return null;
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const vimeoId = url.pathname.split("/").filter(Boolean).pop();
      if (vimeoId && /^\d+$/.test(vimeoId)) {
        return { kind: "embed" as const, url: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`, thumbnailUrl: null };
      }
      return null;
    }
    return { kind: "video" as const, url: url.href, thumbnailUrl: null };
  } catch {
    return null;
  }
}

export default function TestimonialPlayer({ testimonial: t }: { testimonial: Testimonial }) {
  const [playing, setPlaying] = useState(false);
  const [thumbnailReady, setThumbnailReady] = useState(false);
  const thumbnailRef = useRef<HTMLVideoElement>(null);
  const source = t.videoUrl ? playerSource(t.videoUrl) : null;
  const thumbnailUrl = t.imageUrl || source?.thumbnailUrl;
  const thumbnailVideoUrl = !thumbnailUrl && source?.kind === "video" ? source.url : null;

  useEffect(() => {
    const video = thumbnailRef.current;
    if (!video || !thumbnailVideoUrl || playing) return;

    const seekToThumbnail = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = Math.min(Math.max(video.duration * 0.1, 2), 8, video.duration / 2);
      }
    };

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) seekToThumbnail();
    else video.addEventListener("loadedmetadata", seekToThumbnail);

    return () => video.removeEventListener("loadedmetadata", seekToThumbnail);
  }, [thumbnailVideoUrl, playing]);

  if (playing && source) {
    return (
      <div className="testimonial-player">
        {source.kind === "embed" ? (
          <iframe
            src={source.url}
            title={`${t.studentName}'s testimonial`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <video src={source.url} poster={t.imageUrl || undefined} controls autoPlay playsInline preload="metadata" aria-label={`${t.studentName}'s testimonial`} />
        )}
      </div>
    );
  }

  return (
    <motion.div
      className={`video-thumb${thumbnailUrl ? "" : " video-thumb-placeholder"}`}
      style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : undefined}
      aria-label={`${t.studentName} testimonial video preview`}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {!thumbnailUrl && !thumbnailReady && <Video size={26} aria-hidden="true" />}
      {thumbnailVideoUrl && (
        <video
          ref={thumbnailRef}
          className={`testimonial-thumbnail${thumbnailReady ? " is-ready" : ""}`}
          src={thumbnailVideoUrl}
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          onSeeked={() => setThumbnailReady(true)}
        />
      )}
      <div className="video-overlay" />
      {t.score && <div className="score">{t.score}</div>}
      {source && <button type="button" className="play-badge" onClick={() => setPlaying(true)} aria-label={`Play ${t.studentName}'s testimonial`}>▶</button>}
      {t.videoDuration && <div className="video-length">{t.videoDuration}</div>}
      {t.isVerified && <div className="verified">✓ Verified</div>}
    </motion.div>
  );
}
