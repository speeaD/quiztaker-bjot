"use client";

import { User } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import type { StaffMember } from "@/lib/landing-content";

const LOCAL_PHOTOS: Record<string, string> = {
  "Mr. Emmanuel": "/team/emmanuel.jpg",
  "Mr. Evidence": "/team/evidence.jpg",
  "Miss Chioma": "/team/chioma.jpg",
  "Miss Joy": "/team/joy.jpg",
  "Miss Phebe": "/team/phebe.jpg",
};

export default function TeamGrid({ staff }: { staff: StaffMember[] }) {
  return (
    <section className="team-grid-section" id="tutors">
      <div className="wrap">
        <Reveal className="section-head">
          <div className="eyebrow">Our Team</div>
          <h2>Meet the BJOT Tutors and Team</h2>
          <p>
            A passionate team committed to student success, building the
            tools that help Nigerian students prepare different and score
            higher.
          </p>
        </Reveal>

        <StaggerGroup className="team-grid" stagger={0.1}>
          {staff.map((m) => (
            <StaggerItem className="team-card" key={m.id} direction="up" distance={24}>
              <motion.div
                className="team-card-photo"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {m.imageUrl || LOCAL_PHOTOS[m.name] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.imageUrl || LOCAL_PHOTOS[m.name]}
                    alt={m.name}
                  />
                ) : (
                  <div className="team-card-photo-placeholder">
                    <User size={32} />
                  </div>
                )}
              </motion.div>
              <div className="team-card-body">
                <h3 id={`tutor-${encodeURIComponent(m.id)}`} className="scroll-mt-28">{m.name}</h3>
                <span className="team-card-role">{m.course || m.role}</span>
                <p>{m.bio}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
