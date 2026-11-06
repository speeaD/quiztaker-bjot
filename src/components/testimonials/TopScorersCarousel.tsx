'use client';

import Image from 'next/image';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Trophy } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react';
import { scorerPosters, scorerYears } from '@/lib/top-scorers';
import styles from './TopScorersCarousel.module.css';

const postersByYear = scorerYears.map(({ year }) => scorerPosters.filter((poster) => poster.year === year));

function subscribeToMotion(callback: () => void) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  preference.addEventListener('change', callback);
  return () => preference.removeEventListener('change', callback);
}

const getReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const serverReducedMotion = () => true;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

function scrollMetrics(journey: HTMLDivElement, stage: HTMLDivElement) {
  const top = parseFloat(getComputedStyle(stage).top) || 0;
  return {
    start: journey.getBoundingClientRect().top + window.scrollY - top,
    distance: Math.max(1, journey.offsetHeight - stage.offsetHeight),
  };
}

export default function TopScorersCarousel() {
  const [activeYear, setActiveYear] = useState(0);
  const [selectedBoards, setSelectedBoards] = useState(() => scorerYears.map(() => 0));
  const journeyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const activeYearRef = useRef(0);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, getReducedMotion, serverReducedMotion);
  const active = postersByYear[activeYear][selectedBoards[activeYear]];

  const goToYear = useCallback((index: number) => {
    const journey = journeyRef.current;
    const stage = stageRef.current;
    if (!journey || !stage) return;
    const { start, distance } = scrollMetrics(journey, stage);
    window.scrollTo({
      top: start + distance * clamp(index, 0, scorerYears.length - 1) / scorerYears.length,
      behavior: reducedMotion ? 'instant' : 'smooth',
    });
  }, [reducedMotion]);

  useEffect(() => {
    const journey = journeyRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!journey || !stage || !track) return;
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const { start, distance } = scrollMetrics(journey, stage);
      const progress = clamp((window.scrollY - start) / distance, 0, 1);
      const segment = progress * scorerYears.length;
      const year = Math.floor(segment);
      // Give each board a moment at rest, then ease into the next year.
      const transition = clamp((segment - year - 0.35) / 0.65, 0, 1);
      const eased = transition * transition * (3 - 2 * transition);
      const position = Math.min(scorerYears.length - 1, year + eased);
      const index = Math.round(position);
      const visualPosition = reducedMotion ? index : position;

      track.style.transform = `translate3d(${-visualPosition * track.clientWidth}px, 0, 0)`;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${position / (scorerYears.length - 1)})`;
      if (index !== activeYearRef.current) {
        activeYearRef.current = index;
        setActiveYear(index);
      }
    };
    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(journey);
    observer.observe(stage);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    scheduleUpdate();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = { ArrowLeft: activeYear - 1, ArrowRight: activeYear + 1, Home: 0, End: scorerYears.length - 1 }[event.key];
    if (index === undefined || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    goToYear(index);
  };

  return (
    <section id="top-scorers" className={styles.section} aria-labelledby="top-scorers-title" aria-roledescription="carousel">
      <div className={styles.container}>
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}><span /> The BJOT honours board</p>
            <h2 id="top-scorers-title">Their hard work.<br /><span>Extraordinary results.</span></h2>
          </div>
          <div className={styles.intro}>
            <p>Meet our UTME top scorers. Four years of students turning their preparation into something to be proud of.</p>
            <p className={styles.scrollPrompt}><ArrowDown size={14} aria-hidden="true" /> Scroll down to explore the years</p>
            <a className={styles.skipLink} href="#student-stories">Skip to student stories <ArrowUpRight size={12} aria-hidden="true" /></a>
          </div>
        </div>

        <div ref={journeyRef} className={styles.journey}>
          <div ref={stageRef} className={styles.stage}>
            <div className={styles.gallery}>
              <div className={styles.galleryHeader}>
                <div className={styles.years} role="group" aria-label="Choose a scorer year">
                  {scorerYears.map(({ year }, index) => (
                    <button key={year} type="button" aria-current={active.year === year ? 'true' : undefined}
                      aria-label={`Show ${year} top scorers`} onClick={() => goToYear(index)}>{year}</button>
                  ))}
                </div>
                <span className={styles.total}>{String(activeYear + 1).padStart(2, '0')} <span>/ 04</span></span>
                <div ref={progressRef} className={styles.progress} aria-hidden="true" />
              </div>

              <div className={styles.viewport} role="group" tabIndex={0}
                aria-label="Scorer years. Scroll down or use the left and right arrow keys to browse." onKeyDown={onKeyDown}>
                <div id="scorer-year-track" ref={trackRef} className={styles.track}>
                  {scorerYears.map((group, index) => {
                    const poster = postersByYear[index][selectedBoards[index]];
                    return (
                      <div key={group.year} className={styles.slide} role="group" aria-roledescription="slide"
                        aria-label={`${index + 1} of 4: ${group.year} top scorers`}
                        aria-hidden={index !== activeYear} inert={index !== activeYear}>
                        <div className={styles.story}>
                          <p className={styles.edition}>A year to remember</p>
                          <p className={styles.year}>{group.year}</p>
                          <div className={styles.scoreBlock}>
                            <Trophy size={21} strokeWidth={1.5} aria-hidden="true" />
                            <p className={styles.score}>{group.leadingScore}<span>/ 400</span></p>
                            <p className={styles.student}>{group.student}</p>
                            <p className={styles.scoreLabel}>Highest featured score</p>
                          </div>
                          <div className={styles.storyFooter}>
                            <span className={styles.goldLine} />
                            <p>Big dreams.<br />Dedicated preparation.<br />A result worth celebrating.</p>
                          </div>
                        </div>
                        <figure className={styles.poster}>
                          <Image key={poster.src} src={poster.src} alt={poster.alt} width={poster.width} height={poster.height}
                            unoptimized priority={index === 0} draggable={false} className={styles.posterImage} />
                        </figure>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.galleryFooter}>
                <div className={styles.caption}>
                  <p aria-live="polite" aria-atomic="true">{active.year} <span>· Board {active.number} of {active.posters}</span></p>
                  <a href={active.src} target="_blank" rel="noreferrer">View full-size poster <ArrowUpRight size={14} aria-hidden="true" /></a>
                </div>
                <div className={styles.thumbnails} role="group" aria-label={`${active.year} scorer posters`}>
                  {postersByYear[activeYear].map((poster, index) => (
                    <button key={poster.src} type="button" className={styles.thumbnail} aria-label={`Show ${poster.year} board ${poster.number}`}
                      aria-current={selectedBoards[activeYear] === index ? 'true' : undefined}
                      onClick={() => setSelectedBoards((previous) => previous.map((board, year) => year === activeYear ? index : board))}>
                      <Image src={poster.src} alt="" width={48} height={60} unoptimized draggable={false} />
                    </button>
                  ))}
                </div>
                <div className={styles.controls}>
                  <button type="button" aria-label="Previous scorer year" aria-controls="scorer-year-track"
                    disabled={activeYear === 0} onClick={() => goToYear(activeYear - 1)}><ArrowLeft size={19} aria-hidden="true" /></button>
                  <button type="button" aria-label="Next scorer year" aria-controls="scorer-year-track"
                    disabled={activeYear === scorerYears.length - 1} onClick={() => goToYear(activeYear + 1)}><ArrowRight size={19} aria-hidden="true" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className={styles.hint}>Every board tells a story. Your year could be next.</p>
      </div>
    </section>
  );
}
