import { Reveal } from "@/components/motion/Reveal";

export default function TeamCta() {
  return (
    <section>
      <div className="wrap">
        <div className="team-cta">
          <Reveal className="team-block" direction="left" distance={30}>
            <div className="eyebrow">Our team</div>
            <h2>The People Behind BJOT</h2>
            <p>
              A passionate team committed to student success, building the
              tools that help Nigerian students prepare different and score
              higher.
            </p>
            <a href="/about-us" className="btn btn-primary">
              Meet The Team
            </a>
          </Reveal>
          <Reveal className="cta-block" direction="right" distance={30} delay={0.1}>
            <h2>Join Thousands Of Successful Students Today</h2>
            <p>
              Your success story begins here. Start learning, practicing, and
              improving with BJOT — completely free to join.
            </p>
            <div className="ctas">
              <a href="#" className="btn btn-gold">
                Join BJOT Free
              </a>
              <a href="#" className="btn btn-ghost">
                Explore Premium
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}