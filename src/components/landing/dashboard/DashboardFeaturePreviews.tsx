"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Check, FileText, Play, Target, Trophy } from "lucide-react";
import { trackLandingEvent } from "@/lib/landing-tracking";
import styles from "../DashboardWalkthrough.module.css";

function PastQuestionsPreview() {
  return (
    <div
      className={styles.questionPreview}
      aria-label="Sample past-question practice preview"
    >
      <div className={styles.previewBar}>
        <span>JAMB question practice</span>
        <span>Subject · Biology</span>
      </div>
      <div className={styles.questionBody}>
        <p className={styles.questionLabel}>
          QUESTION 12 <span>Review answer</span>
        </p>
        <h3>
          Which structure controls the movement of substances into and out of a
          cell?
        </h3>
        <ol className={styles.answerOptions}>
          <li>
            <span>A</span> Cell wall
          </li>
          <li className={styles.selected}>
            <span>B</span> Cell membrane <Check size={16} aria-hidden="true" />
          </li>
          <li>
            <span>C</span> Cytoplasm
          </li>
          <li>
            <span>D</span> Nucleus
          </li>
        </ol>
        <div className={styles.explanation}>
          <strong>
            <Check size={15} aria-hidden="true" /> Correct answer: B · Cell
            membrane
          </strong>
          <p>
            The cell membrane is selectively permeable. It regulates what enters
            and leaves the cell, helping maintain a stable internal environment.
          </p>
        </div>
      </div>
      <p className={styles.previewCaption}>
        Illustrative question preview · Subject and year coverage varies by
        available paper
      </p>
    </div>
  );
}

function CbtPreview() {
  return (
    <div
      className={styles.cbtPreview}
      aria-label="Illustrative CBT exam workspace"
    >
      <div className={styles.cbtTop}>
        <div>
          <strong>CBT Simulator</strong>
          <small>Exam in progress · Demo</small>
        </div>
        <span className={styles.timer}>01:57:30</span>
        <span className={styles.submit}>Submit exam</span>
      </div>
      <div className={styles.subjects}>
        <b>English</b>
        <span>Biology</span>
        <span>Chemistry</span>
        <span>Physics</span>
      </div>
      <div className={styles.cbtBody}>
        <div className={styles.passage}>
          <small>ENGLISH · PASSAGE</small>
          <p>
            Good preparation grows from steady effort. A short study session,
            followed by a review of mistakes, can make the next session more
            focused.
          </p>
          <strong>Question 18 of 180</strong>
        </div>
        <div className={styles.cbtQuestion}>
          <small>BIOLOGY · QUESTION 42</small>
          <strong>
            Which organelle is the main site of aerobic respiration?
          </strong>
          <div
            className={styles.cellDiagram}
            role="img"
            aria-label="Simplified biology cell diagram with mitochondrion highlighted"
          >
            <span className={styles.cellNucleus}>Nucleus</span>
            <span className={styles.mitochondrion}>Mitochondrion</span>
            <span className={styles.cellLabel}>Cell diagram</span>
          </div>
          <div className={styles.navNumbers}>
            <span>40</span>
            <span>41</span>
            <b>42</b>
            <span>43</span>
            <span>44</span>
          </div>
        </div>
      </div>
      <p className={styles.previewCaption}>
        Illustrative exam workspace · Setup, timer, navigation, answer
        selection, submission, and review
      </p>
    </div>
  );
}

function GamePreview() {
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const start = () => {
    setPlaying(true);
    trackLandingEvent("video_play", { video: "gameplay" });
    requestAnimationFrame(() => {
      void video.current?.play();
    });
  };
  return (
    <div className={styles.gamePreview}>
      <div className={styles.gameImage}>
        {playing ? (
          <video
            ref={video}
            controls
            playsInline
            preload="none"
            poster="/dashboard-previews/gameplay-poster.png"
            aria-label="BJOT gameplay demonstration"
          >
            <source src="/dashboard-previews/gameplay.mp4" type="video/mp4" />
          </video>
        ) : (
          <>
            <Image
              src="/dashboard-previews/game-hub.jpg"
              alt="Game Hub mode cards for Time Attack, Sudden Death, and Scholar’s Wager"
              width={1080}
              height={720}
              sizes="(max-width: 800px) 90vw, 44vw"
            />
            <button
              className={styles.playButton}
              type="button"
              onClick={start}
              aria-label="Play BJOT gameplay demonstration"
            >
              <Play fill="currentColor" size={22} aria-hidden="true" />
              Watch gameplay
            </button>
          </>
        )}
      </div>
      <div className={styles.leaderboard}>
        <div className={styles.leaderboardTitle}>
          <Trophy size={18} aria-hidden="true" />
          <strong>The BJOT Scholar of the Week</strong>
        </div>
        <div className={styles.leaderRows}>
          <span>01</span>
          <b>Scholar leaderboard</b>
          <small>Weekly rankings</small>
        </div>
        <p>See the leaderboard preview inside the dashboard.</p>
      </div>
    </div>
  );
}

export function TrackerDetails() {
  return (
    <div className={styles.trackerDetails}>
      <div className={styles.trackerHeader}>
        <strong>Subject performance</strong>
        <span>Demo data</span>
      </div>
      <div className={styles.subjectBars}>
        <span>Biology</span>
        <i>
          <b style={{ width: "72%" }} />
        </i>
        <strong>72%</strong>
        <span>Chemistry</span>
        <i>
          <b style={{ width: "58%" }} />
        </i>
        <strong>58%</strong>
        <span>Physics</span>
        <i>
          <b style={{ width: "46%" }} />
        </i>
        <strong>46%</strong>
      </div>
      <p>
        <Target size={14} aria-hidden="true" /> Focus next: revisit Chemical
        Bonding and Mechanics
      </p>
    </div>
  );
}

export function MockDetails() {
  return (
    <div className={styles.mockDetails}>
      <div className={styles.mockTitle}>
        <FileText size={16} aria-hidden="true" />
        <strong>Assigned biweekly mock</strong>
        <span>DEMO</span>
      </div>
      <div className={styles.mockResult}>
        <strong>Mock 04 · Submitted</strong>
        <b>286 / 400</b>
      </div>
      <div className={styles.mockSubjects}>
        <span>
          English <b>68%</b>
        </span>
        <span>
          Biology <b>76%</b>
        </span>
        <span>
          Chemistry <b>62%</b>
        </span>
        <span>
          Physics <b>54%</b>
        </span>
      </div>
      <p>
        Revision focus: review Physics calculations and Chemistry bonding before
        the next mock.
      </p>
    </div>
  );
}

function ManualsPreview() {
  const books = [
    {
      title: "Physics Formula Bank",
      description:
        "39 UTME topics, essential formulas, and 390 targeted questions with detailed solutions.",
      position: "0% 100%",
    },
    {
      title: "Crack Organic Chemistry",
      description:
        "Foundations, nomenclature, homologous series, and polymers, supported by concept-based UTME practice.",
      position: "100% 100%",
    },
    {
      title: "The Government Hack Manual",
      description:
        "Essential definitions, precolonial-to-postcolonial history, and 200+ UTME history questions.",
      position: "0% 0%",
    },
    {
      title: "Literature Text Mastery",
      description:
        "Chapter and scene analysis, concise summaries, literary terms, and UTME-style questions.",
      position: "100% 0%",
    },
  ];
  return (
    <div className={styles.manualsPreview}>
      <div className={styles.bookGrid}>
        {books.map((book) => (
          <article className={styles.bookCard} key={book.title}>
            <div className={styles.bookArt}>
              <Image
                src="/dashboard-previews/textbooks.jpg"
                alt=""
                fill
                sizes="(max-width: 600px) 40vw, 180px"
                style={{ objectFit: "cover", objectPosition: book.position }}
              />
            </div>
            <div>
              <h3>{book.title}</h3>
              <p>{book.description}</p>
            </div>
          </article>
        ))}
      </div>
      <p className={styles.manualEligibility}>
        Included with eligible premium plans, based on your department. Current
        plan details list the Physics Formula Bank and Organic Chemistry manual
        under Science Ultimate Pro Max.
      </p>
    </div>
  );
}


export function DashboardFeaturePreview({ featureId }: { featureId: string }) {
  if (featureId === "manuals") return <ManualsPreview />;
  if (featureId === "past-questions") return <PastQuestionsPreview />;
  if (featureId === "cbt") return <CbtPreview />;
  if (featureId === "games") return <GamePreview />;
  return null;
}
