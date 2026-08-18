

import { Star, Calendar, TrendingUp, Trophy } from "lucide-react"

const STATS = [
  { icon: <Trophy  color="white" size={40}/>, num: "5k+", lbl: "Students Passed\nJAMB & WAEC" },
  { icon: <Star  color="white" size={40}/>, num: "368", lbl: "Highest UTME\nScore Recorded" },
  { icon: <TrendingUp  color="white" size={40}/>, num: "30k+", lbl: "Students Reached\nNationwide" },
  { icon: <Calendar  color="white" size={40}/>, num: "4+", lbl: "Years of Impact\n(2022 – 2026)" },
];

export default function StatsBar() {
  return (
    <div className="stats-bar">
      <div className="stats-inner">
        {STATS.map((s) => (
          <div className="stat" key={s.num}>
            <div className="icon">{s.icon}</div>
            <div className="stat-text">
              <div className="num">{s.num}</div>
              <div className="lbl">
                {s.lbl.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br />}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
