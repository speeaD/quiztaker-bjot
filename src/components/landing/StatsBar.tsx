import { Star, Calendar, TrendingUp, Trophy } from "lucide-react";
import { StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { Counter } from "@/components/motion/Counter";

const STATS = [
  { icon: <Trophy color="white" size={40} />, num: "5,000+", lbl: "Students Passed\nJAMB & WAEC" },
  { icon: <Star color="white" size={40} />, num: "368", lbl: "Highest UTME\nScore Recorded" },
  { icon: <TrendingUp color="white" size={40} />, num: "30,000+", lbl: "Students Reached\nNationwide" },
  { icon: <Calendar color="white" size={40} />, num: "4+", lbl: "Years of Impact\n(2022 – 2026)" },
];

export default function StatsBar() {
  return (
    <div className="stats-bar">
      <StaggerGroup className="stats-inner" stagger={0.1}>
        {STATS.map((s) => (
          <StaggerItem className="stat" key={s.num} direction="up" distance={20}>
            <div className="icon">{s.icon}</div>
            <div className="stat-text">
              <div className="num">
                <Counter value={s.num} />
              </div>
              <div className="lbl">
                {s.lbl.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br />}
                  </span>
                ))}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}