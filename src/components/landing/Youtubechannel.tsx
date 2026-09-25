import { Youtube, Video, Users, PlayCircle } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import type { SectionContent } from "@/lib/landing-content";

const ICONS = [<Video size={18} key="v" />, <Users size={18} key="u" />, <PlayCircle size={18} key="p" />];

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

export default function YouTubeChannel({ content }: { content: SectionContent }) {
  return (
    <section className="yt-section">
      <div className="wrap yt-wrap">
        <Reveal className="yt-copy" direction="left" distance={30}>
          <div className="eyebrow">{content.eyebrow}</div>
          <h2>{content.heading}</h2>
          <p>{content.description}</p>

          <div className="yt-stats">
            {(content.metrics ?? []).map((s, index) => (
              <div className="yt-stat" key={`${s.label}-${index}`}>
                <span className="yt-stat-icon">{ICONS[index % ICONS.length]}</span>
                <div>
                  <div className="yt-stat-value">{s.value}</div>
                  <div className="yt-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {content.cta && <a
            href={content.cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="yt-cta"
          >
            <Youtube size={18} />
            {content.cta.label}
          </a>}
        </Reveal>

        <StaggerGroup className="yt-gallery" stagger={0.15}>
          {(content.gallery ?? []).map((p, index) => (
            <StaggerItem
              className="yt-photo"
              key={`${p.caption}-${index}`}
              direction="right"
              distance={30}
              style={{ backgroundImage: `url(${p.imageUrl ?? BTS_PHOTOS[index]?.img ?? ""})` }}
              aria-label={`${p.caption} behind the scenes photo`}
            >
              <div className="yt-photo-overlay" />
              <span className="yt-photo-tag">{p.label}</span>
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
