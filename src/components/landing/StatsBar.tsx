import { Star, Calendar, TrendingUp, Trophy } from "lucide-react";
import { StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { Counter } from "@/components/motion/Counter";
import type { SectionContent } from "@/lib/landing-content";

const ICONS = [<Trophy color="white" size={40} key="t" />, <Star color="white" size={40} key="s" />, <TrendingUp color="white" size={40} key="u" />, <Calendar color="white" size={40} key="c" />];

export default function StatsBar({ content }: { content: SectionContent }) {
  return (
    <div className="stats-bar">
      <StaggerGroup className="stats-inner" stagger={0.1}>
        {(content.items ?? []).map((s, index) => (
          <StaggerItem className="stat" key={`${s.label}-${index}`} direction="up" distance={20}>
            <div className="icon">{ICONS[index % ICONS.length]}</div>
            <div className="stat-text">
              <div className="num">
                <Counter value={s.value} />
              </div>
              <div className="lbl">
                {s.label}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}
