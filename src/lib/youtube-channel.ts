import 'server-only';
import { parseYouTubeChannel, parseYouTubeFeed, youtubeChannelId, youtubeChannelUrl, type YouTubeChannelData } from './youtube-feed';

export async function getYouTubeChannel(): Promise<YouTubeChannelData | null> {
  const read = async (url: string) => {
    const response = await fetch(url, {
      headers: { 'Accept-Language': 'en-US,en;q=0.9' },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error('YouTube is temporarily unavailable');
    return response.text();
  };
  const [feed, channel] = await Promise.allSettled([
    read(`https://www.youtube.com/feeds/videos.xml?channel_id=${youtubeChannelId}`).then(parseYouTubeFeed),
    read(`${youtubeChannelUrl}/videos?hl=en`).then(parseYouTubeChannel),
  ]);
  const uploads = feed.status === 'fulfilled' ? feed.value : null;
  const summary = channel.status === 'fulfilled' ? channel.value : null;
  if (!uploads && !summary) return null;
  return { title: summary?.title || uploads?.title || 'BJOT OFFICIAL', avatar: summary?.avatar ?? null,
    subscribers: summary?.subscribers ?? null, videoCount: summary?.videoCount ?? null, views: summary?.views ?? null,
    videos: uploads?.videos ?? [] };
}
