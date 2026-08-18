import { User } from "lucide-react";

// `focal` is a CSS object-position value tuned to each photo's own framing —
// tight headshots, close-up crops, and wider environmental shots all need
// a different crop point, so this isn't a shared constant. Re-check this
// value any time a member's photo is replaced.
const TEAM = [
  {
    name: "Mr. Emmanuel",
    role: "Medicine and Surgery",
    bio: "Dedicated science instructor focused on simplifying complex biological concepts to help students secure admissions into competitive medical programs.",
    img: "/team/emmanuel.jpg",
    focal: "center 25%",
  },
  {
    name: "Mr. Evidence",
    role: "Quantity Surveying",
    bio: "Analytical tutor specializing in mathematical reasoning and quantitative problem-solving for aspiring engineering and science students.",
    img: "/team/evidence.jpg",
    focal: "center 20%",
  },
  {
    name: "Miss Chioma",
    role: "Medical Laboratory Science",
    bio: "Experienced educator passionate about breaking down difficult scientific principles and guiding students toward academic excellence.",
    img: "/team/chioma.jpg",
    focal: "center 15%",
  },
  {
    name: "Miss Joy",
    role: "Law",
    bio: "Expert arts and humanities instructor dedicated to sharpening students' critical thinking, language skills, and essay performance.",
    img: "/team/joy.jpg",
    focal: "center 85%",
  },
  {
    name: "Miss Phebe",
    role: "Pure and Industrial Chemistry",
    bio: "Dynamic science tutor focused on building rock-solid foundations in core chemistry to help students ace their examinations.",
    img: "/team/phebe.jpg",
    focal: "center 55%",
  },
];

export default function TeamGrid() {
  return (
    <section className="team-grid-section">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Our Team</div>
          <h2>The People Behind BJOT</h2>
          <p>
            A passionate team committed to student success, building the
            tools that help Nigerian students prepare different and score
            higher.
          </p>
        </div>

        <div className="team-grid">
          {TEAM.map((m, i) => (
            <div className="team-card" key={i}>
              <div className="team-card-photo">
                {m.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.img}
                    alt={m.name}
                    style={{ objectPosition: m.focal }}
                  />
                ) : (
                  <div className="team-card-photo-placeholder">
                    <User size={32} />
                    <span>Add photo</span>
                  </div>
                )}
              </div>
              <div className="team-card-body">
                <h3>{m.name}</h3>
                <span className="team-card-role">{m.role}</span>
                <p>{m.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}