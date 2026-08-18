import { Youtube, Video, Users, PlayCircle } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

const STATS = [
  { icon: <Video size={18} />, label: "Lesson Videos", value: "120+" },
  { icon: <Users size={18} />, label: "Subscribers", value: "15k+" },
  { icon: <PlayCircle size={18} />, label: "Total Views", value: "500k+" },
];

const BTS_PHOTOS = [
  {
    img: "/bts-whiteboard.jpg",
    caption: "Mathematics — Indices & Logarithms",
    tag: "In the studio",
  },
  {
    img: "/bts-studio.jpg",
    caption: "Probability — Solved Examples",
    tag: "Behind the scenes",
  },
];

export default function YouTubeChannel() {
  return (
    <section className="yt-section">
      <div className="wrap yt-wrap">
        <Reveal className="yt-copy" direction="left" distance={30}>
          <div className="eyebrow">Watch &amp; Learn</div>
          <h2>Free Lessons, Every Week, On YouTube</h2>
          <p>
            Every BJOT lesson starts right here in our own studio — real
            tutors breaking down JAMB and WAEC topics step by step, filmed
            and uploaded so you can rewatch anytime, for free.
          </p>

          <div className="yt-stats">
            {STATS.map((s) => (
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
            href="https://youtube.com/@bjot"
            target="_blank"
            rel="noopener noreferrer"
            className="yt-cta"
          >
            <Youtube size={18} />
            Subscribe on YouTube
          </a>
        </Reveal>

        <StaggerGroup className="yt-gallery" stagger={0.15}>
          {BTS_PHOTOS.map((p) => (
            <StaggerItem
              className="yt-photo"
              key={p.caption}
              direction="right"
              distance={30}
              style={{ backgroundImage: `url(${p.img})` }}
              aria-label={`${p.caption} behind the scenes photo`}
            >
              <div className="yt-photo-overlay" />
              <span className="yt-photo-tag">{p.tag}</span>
              <div className="yt-photo-play">
                <PlayCircle size={20} />
              </div>
              <p className="yt-photo-caption">{p.caption}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}