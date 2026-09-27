import type { ReactNode } from "react";
import Link from "next/link";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import { getLandingContent, section } from "@/lib/landing-content";
import styles from "./LegalPage.module.css";

type LegalSection = { title: string; content: ReactNode };

export default async function LegalPage({ title, sections }: { title: string; sections: LegalSection[] }) {
  const content = await getLandingContent();
  const footer = content && section(content, "global.footer");

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <article className={styles.article}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/">Home</Link> / <span aria-current="page">{title}</span>
          </nav>
          <h1>{title}</h1>
          <p className={styles.subtitle}>{title} for BJOT (Blast JAMB Online Tutorial)</p>
          <p className={styles.date}>Effective Date: <time dateTime="2026-08">August 2026</time></p>
          {sections.map((entry, index) => (
            <section key={entry.title} className={styles.section}>
              <h2>{index + 1}. {entry.title}</h2>
              {entry.content}
            </section>
          ))}
        </article>
      </main>
      <Footer
        content={footer ?? { brand: "BJOT", tagline: "Blast JAMB Online Tutorial" }}
        contact={content?.contact ?? null}
      />
    </>
  );
}
