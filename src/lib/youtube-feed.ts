export const youtubeChannelId = 'UCxTUgd7UFhlB88jsRX7utRg';
export const youtubeChannelUrl = 'https://www.youtube.com/@bjotofficial';

export type YouTubeVideo = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt: string;
  views: number | null;
  isShort: boolean;
};

export type YouTubeChannelSummary = {
  title: string;
  avatar: string | null;
  subscribers: string | null;
  videoCount: string | null;
  views: string | null;
};

export type YouTubeChannelData = YouTubeChannelSummary & { videos: YouTubeVideo[] };

function decodeXml(value: string): string {
  return value.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1').replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (entity, name: string) => {
    const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
    if (name[0] !== '#') return named[name.toLowerCase()] ?? entity;
    const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1));
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
  }).trim();
}

function tag(xml: string, name: string): string {
  return decodeXml(xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1] ?? '');
}

export function parseYouTubeFeed(xml: string): { title: string; videos: YouTubeVideo[] } {
  const head = xml.split('<entry>')[0];
  const channelId = tag(head, 'yt:channelId');
  // YouTube's feed header sometimes omits the UC prefix; entry IDs retain it.
  if (channelId !== youtubeChannelId && channelId !== youtubeChannelId.slice(2)) throw new Error('Unexpected YouTube channel');
  const seen = new Set<string>();
  const videos: YouTubeVideo[] = [];
  for (const match of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const entry = match[1];
    const id = tag(entry, 'yt:videoId');
    const title = tag(entry, 'title');
    const publishedAt = tag(entry, 'published');
    if (tag(entry, 'yt:channelId') !== youtubeChannelId || !/^[\w-]{11}$/.test(id) || seen.has(id) || !title || !Number.isFinite(Date.parse(publishedAt))) continue;
    seen.add(id);
    const count = entry.match(/<media:statistics\b[^>]*\bviews=["'](\d+)["']/)?.[1];
    const views = count === undefined ? null : Number(count);
    const isShort = entry.includes(`/shorts/${id}`);
    videos.push({ id, title, publishedAt: new Date(publishedAt).toISOString(),
      url: isShort ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      views: views !== null && Number.isSafeInteger(views) ? views : null, isShort });
  }
  videos.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  return { title: tag(head, 'title'), videos };
}

type Text = { simpleText?: string; runs?: { text?: string }[] };
type InitialData = {
  metadata?: { channelMetadataRenderer?: { externalId?: string; title?: string; avatar?: { thumbnails?: { url?: string }[] } } };
  header?: {
    pageHeaderRenderer?: { content?: { pageHeaderViewModel?: { metadata?: { contentMetadataViewModel?: {
      metadataRows?: { metadataParts?: { text?: { content?: string } }[] }[];
    } } } } };
    c4TabbedHeaderRenderer?: { subscriberCountText?: Text; videosCountText?: Text };
  };
};

function initialData(html: string): InitialData {
  const assignment = /(?:ytInitialData|window\["ytInitialData"\])\s*=\s*\{/.exec(html);
  if (!assignment) throw new Error('YouTube channel metadata is unavailable');
  const start = assignment.index + assignment[0].length - 1;
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = start; index < html.length; index++) {
    const character = html[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') quoted = false;
    } else if (character === '"') quoted = true;
    else if (character === '{') depth++;
    else if (character === '}' && --depth === 0) return JSON.parse(html.slice(start, index + 1));
  }
  throw new Error('Incomplete YouTube channel metadata');
}

export function parseYouTubeChannel(html: string): YouTubeChannelSummary {
  const data = initialData(html);
  const metadata = data.metadata?.channelMetadataRenderer;
  if (metadata?.externalId !== youtubeChannelId || !metadata.title) throw new Error('Unexpected YouTube channel');
  const labels = (data.header?.pageHeaderRenderer?.content?.pageHeaderViewModel?.metadata?.contentMetadataViewModel?.metadataRows ?? [])
    .flatMap((row) => (row.metadataParts ?? []).map((part) => part.text?.content ?? ''));
  const legacy = data.header?.c4TabbedHeaderRenderer;
  for (const text of [legacy?.subscriberCountText, legacy?.videosCountText]) {
    if (text) labels.push(text.simpleText ?? text.runs?.map((run) => run.text ?? '').join('') ?? '');
  }
  const count = (unit: string) => {
    const pattern = new RegExp(`^([\\d.,]+\\s*[kmb]?)\\s+${unit}s?$`, 'i');
    const match = labels.map((label) => label.match(pattern)).find(Boolean);
    return match?.[1].trim().toUpperCase() ?? null;
  };
  const avatar = metadata.avatar?.thumbnails?.at(-1)?.url;
  return { title: metadata.title, subscribers: count('subscriber'), videoCount: count('video'), views: count('view'),
    avatar: avatar && /^https:\/\/yt3\.googleusercontent\.com\//.test(avatar) ? avatar : null };
}
