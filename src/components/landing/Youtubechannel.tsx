import Image from 'next/image';
import { Suspense } from 'react';
import { Youtube, Video, Users, PlayCircle } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import type { SectionContent } from "@/lib/landing-content";
import { getYouTubeChannel } from '@/lib/youtube-channel';
import { youtubeChannelUrl, type YouTubeChannelData } from '@/lib/youtube-feed';

export default function YouTubeChannel({ content }: { content: SectionContent }) {
  return <Suspense fallback={<ChannelSection content={content} channel={null} />}><LiveChannel content={content} /></Suspense>;
}

async function LiveChannel({ content }: { content: SectionContent }) {
  return <ChannelSection content={content} channel={await getYouTubeChannel()} />;
}

function ChannelSection({ content, channel }: { content: SectionContent; channel: YouTubeChannelData | null }) {
  const metrics = [
    { value: channel?.videoCount, label: 'Videos', icon: <Video size={18} /> },
    { value: channel?.subscribers, label: 'Subscribers', icon: <Users size={18} /> },
    { value: channel?.views, label: 'Channel views', icon: <PlayCircle size={18} /> },
  ].filter((metric) => metric.value !== null && metric.value !== undefined);
  const videos = channel?.videos.slice(0, 2) ?? [];
  return (
    <section id="youtube" className="yt-section" aria-labelledby="youtube-title">
      <div className="wrap yt-wrap">
        <Reveal className="yt-copy" direction="left" distance={30}>
          <div className="eyebrow">{content.eyebrow || 'Watch & learn'}</div>
          <h2 id="youtube-title">Learn with BJOT on YouTube</h2>
          <p>Watch the latest lessons, revision videos and quick UTME drills from our official channel. Find a topic, press play and keep learning.</p>
          <a className="yt-channel-name" href={youtubeChannelUrl} target="_blank" rel="noopener noreferrer">
            <span className="yt-channel-mark"><Youtube size={20} aria-hidden="true" /></span>
            <span>{channel?.title || 'BJOT OFFICIAL'}<small>@BJOTOFFICIAL</small></span>
          </a>

          <div className="yt-stats">
            {metrics.map((s) => (
              <div className="yt-stat" key={s.label}>
                <span className="yt-stat-icon">{s.icon}</span>
                <div>
                  <div className="yt-stat-value">{s.value}</div>
                  <div className="yt-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <a
            href={youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="yt-cta"
          >
            <Youtube size={18} />
            Visit our YouTube channel
          </a>
        </Reveal>

        <StaggerGroup className="yt-gallery" stagger={0.15}>
          {videos.map((video) => (
            <StaggerItem
              key={video.id}
              direction="right"
              distance={30}
            >
              <a className="yt-video" href={video.url} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${video.title} on YouTube`}>
                <div className="yt-video-image">
                  <Image unoptimized src={video.thumbnail} alt="" width={480} height={360} />
                  <span className="yt-video-type">{video.isShort ? 'YouTube Short' : 'YouTube lesson'}</span>
                  <span className="yt-video-play"><PlayCircle size={30} aria-hidden="true" /></span>
                </div>
                <div className="yt-video-body">
                  <h3>{video.title}</h3>
                  <p><time dateTime={video.publishedAt}>{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Lagos' }).format(new Date(video.publishedAt))}</time>
                    {video.views !== null && <span> · {video.views.toLocaleString('en-GB')} views</span>}
                  </p>
                </div>
              </a>
            </StaggerItem>
          ))}
          {!videos.length && <a className="yt-channel-fallback" href={`${youtubeChannelUrl}/videos`} target="_blank" rel="noopener noreferrer">
            <Youtube size={46} aria-hidden="true" />
            <strong>Explore BJOT OFFICIAL</strong>
            <span>Watch our videos on YouTube</span>
          </a>}
        </StaggerGroup>
      </div>
    </section>
  );
}
