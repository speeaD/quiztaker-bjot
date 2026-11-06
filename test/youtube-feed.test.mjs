import test from 'node:test';
import assert from 'node:assert/strict';
import { parseYouTubeChannel, parseYouTubeFeed, youtubeChannelId } from '../src/lib/youtube-feed.ts';

const entry = (overrides = {}) => {
  const video = { id: 'SrTnhVIgRwI', channel: youtubeChannelId, title: 'English &amp; Chemistry &#x1F9EA;', published: '2026-11-02T13:33:58+00:00', views: '802', ...overrides };
  return `<entry><yt:videoId>${video.id}</yt:videoId><yt:channelId>${video.channel}</yt:channelId><title>${video.title}</title>
    <link rel="alternate" href="https://www.youtube.com/shorts/${video.id}"/><published>${video.published}</published>
    <media:group><media:statistics views="${video.views}"/></media:group></entry>`;
};
const feed = (entries, id = youtubeChannelId.slice(2)) => `<feed><yt:channelId>${id}</yt:channelId><title>BJOT OFFICIAL</title>${entries}</feed>`;
const metadata = () => ({ metadata: { channelMetadataRenderer: { externalId: youtubeChannelId, title: 'BJOT OFFICIAL',
  avatar: { thumbnails: [{ url: 'https://yt3.googleusercontent.com/channel-photo' }] } } },
  header: { pageHeaderRenderer: { content: { pageHeaderViewModel: { metadata: { contentMetadataViewModel: {
    metadataRows: [{ metadataParts: [{ text: { content: '@BJOTOFFICIAL' } }] },
      { metadataParts: [{ text: { content: '1.65k subscribers' } }, { text: { content: '21 videos' } }] }],
  } } } } } } });
const html = (value) => `<script>var ytInitialData = ${JSON.stringify(value)};</script>`;

test('public feed reads real upload IDs, titles, dates, thumbnails, views and Shorts links', () => {
  const result = parseYouTubeFeed(feed(entry()));
  assert.equal(result.title, 'BJOT OFFICIAL');
  assert.deepEqual(result.videos[0], { id: 'SrTnhVIgRwI', title: 'English & Chemistry 🧪',
    publishedAt: '2026-11-02T13:33:58.000Z', views: 802, isShort: true,
    thumbnail: 'https://i.ytimg.com/vi/SrTnhVIgRwI/hqdefault.jpg', url: 'https://www.youtube.com/shorts/SrTnhVIgRwI' });
});

test('uploads are sorted newest first, deduplicated, and invalid or foreign uploads are excluded', () => {
  const result = parseYouTubeFeed(feed(entry({ published: '2026-10-01' }) + entry({ id: 'kPUQWF_NcX8', published: '2026-11-02' }) + entry()
    + entry({ id: 'invalid' }) + entry({ id: 'foreign0000', channel: 'another-channel' }) + entry({ id: 'invaliddate', published: 'not-a-date' })));
  assert.deepEqual(result.videos.map((video) => video.id), ['kPUQWF_NcX8', 'SrTnhVIgRwI']);
});

test('standard videos open the watch page and zero views stay valid', () => {
  const result = parseYouTubeFeed(feed(entry({ views: '0' }).replace('/shorts/SrTnhVIgRwI', '/watch?v=SrTnhVIgRwI'), youtubeChannelId));
  assert.equal(result.videos[0].url, 'https://www.youtube.com/watch?v=SrTnhVIgRwI');
  assert.equal(result.videos[0].isShort, false);
  assert.equal(result.videos[0].views, 0);
});

test('missing view data stays unknown and the wrong channel cannot replace BJOT content', () => {
  const result = parseYouTubeFeed(feed(entry().replace('<media:statistics views="802"/>', '')));
  assert.equal(result.videos[0].views, null);
  assert.throws(() => parseYouTubeFeed(feed(entry(), 'wrong-channel')));
});

test('channel statistics come from YouTube metadata with no invented total views', () => {
  assert.deepEqual(parseYouTubeChannel(html(metadata())), { title: 'BJOT OFFICIAL', subscribers: '1.65K', videoCount: '21',
    views: null, avatar: 'https://yt3.googleusercontent.com/channel-photo' });
});

test('metadata scanner handles braces and escaped quotes within descriptions', () => {
  const data = metadata();
  data.metadata.channelMetadataRenderer.description = 'A topic with {braces} and "quotes"';
  assert.equal(parseYouTubeChannel(html(data)).videoCount, '21');
});

test('legacy metadata is supported and hidden counts remain absent', () => {
  const data = metadata();
  data.header = { c4TabbedHeaderRenderer: { subscriberCountText: { runs: [{ text: '1.65K subscribers' }] }, videosCountText: { simpleText: '21 videos' } } };
  assert.equal(parseYouTubeChannel(html(data)).subscribers, '1.65K');
  data.header = {};
  const result = parseYouTubeChannel(html(data));
  assert.equal(result.subscribers, null);
  assert.equal(result.videoCount, null);
  assert.equal(result.views, null);
});

test('unavailable or unrelated channel pages fail safely', () => {
  assert.throws(() => parseYouTubeChannel('<html>temporarily unavailable</html>'));
  const data = metadata();
  data.metadata.channelMetadataRenderer.externalId = 'wrong-channel';
  assert.throws(() => parseYouTubeChannel(html(data)));
});
