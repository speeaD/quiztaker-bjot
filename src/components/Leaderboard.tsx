'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Award, ChevronLeft, ChevronRight, CircleDollarSign, Crown, Hourglass, Info, RefreshCw, Search, ShieldCheck, Star, Timer, Trophy, Zap } from 'lucide-react';
import { StudentHeader } from '@/components/layout/StudentHeader';
import { GameId, GAMES } from '@/lib/games';
import { GameLeaderboardEntry, LeaderboardResponse, OverallLeaderboardEntry } from '@/types/leaderboard';
import styles from './leaderboard/Leaderboard.module.css';

type TabId = 'overall' | GameId;
type Entry = GameLeaderboardEntry | OverallLeaderboardEntry;
const tabs = [
  { id: 'overall' as const, label: 'Overall', Icon: Trophy },
  { id: 'time-attack' as const, label: 'Time Attack', Icon: Timer },
  { id: 'sudden-death' as const, label: 'Sudden Death', Icon: Zap },
  { id: 'scholars-wager' as const, label: "Scholar's Wager", Icon: CircleDollarSign },
];
const tracks = [{ id: 'all', label: 'All contenders' }, { id: 'science', label: 'Sciences' }, { id: 'commercial', label: 'Commercial' }, { id: 'arts', label: 'Arts' }];
const PAGE_SIZE = 10;
const score = (entry: Entry) => 'totalScore' in entry ? entry.totalScore : entry.score;
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'BS';
const department = (value?: string | null) => {
  const normalized = value?.toLowerCase() || '';
  return normalized === 'art' ? 'arts' : normalized === 'sciences' ? 'science' : normalized;
};
const trackName = (value?: string | null) => tracks.find(track => track.id === department(value))?.label || 'BJOT Scholar';
const dateLabel = (date: string) => new Date(date).toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short' });
function countdown(end: string, now: number) {
  const minutes = Math.max(0, Math.ceil((new Date(end).getTime() - now) / 60000));
  return minutes ? `${Math.floor(minutes / 1440)}d ${Math.floor(minutes % 1440 / 60)}h ${minutes % 60}m left` : 'New week · refresh rankings';
}
function Avatar({ entry, large = false }: { entry: Entry; large?: boolean }) {
  return <span className={`${styles.avatar} ${large ? styles.avatarLarge : ''}`} data-tone={entry.rank <= 3 ? entry.rank : entry.rank % 5 + 4}>{initials(entry.displayName)}{large && <small>#{entry.rank}</small>}</span>;
}
function Rank({ rank }: { rank: number }) {
  return rank <= 3 ? <span className={styles.medal} data-place={rank} aria-label={`Rank ${rank}`}><Award size={17} /></span> : <span className={styles.rank}>#{rank}</span>;
}
function PodiumCard({ entry, tab }: { entry: Entry; tab: TabId }) {
  const first = entry.rank === 1;
  return <article className={`${styles.podiumCard} ${first ? styles.champion : ''}`} data-place={entry.rank}>
    <span className={styles.placeLabel}>{first ? <Crown size={14} /> : <Award size={12} />}{first ? 'Weekly champion' : entry.rank === 2 ? '2nd place' : '3rd place'}</span>
    <Avatar entry={entry} large />
    <h3>{entry.displayName}{first && <span className={styles.nameFlag} aria-hidden="true" />}</h3>
    <p className={styles.playerTrack}>{trackName(entry.department)}</p>
    {first && <span className={styles.aceBadge}>{tab === 'overall' ? 'All-round scholar' : `${tabs.find(t => t.id === tab)!.label} ace`}</span>}
    <dl className={styles.podiumStats}>
      <div><dt>{'gamesPlayed' in entry ? 'Challenges played' : tab === 'sudden-death' ? 'Best streak' : 'Correct answers'}</dt><dd>{'gamesPlayed' in entry ? `${entry.gamesPlayed} of 3` : entry.correctAnswers != null ? `${entry.correctAnswers} correct` : '—'}</dd></div>
      <div><dt>Weekly points</dt><dd className={styles.points}>{score(entry).toLocaleString()} <small>pts</small></dd></div>
    </dl>
    <div className={styles.podiumFoot}><span>Achieved</span><strong>{dateLabel(entry.achievedAt)}</strong></div>
  </article>;
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<TabId>('sudden-death');
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState('all');
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(0);
  const inFlight = useRef(false);
  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true; setLoading(true); setError('');
    try {
      const response = await fetch('/api/leaderboard?limit=100', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load rankings');
      const json: LeaderboardResponse = await response.json();
      if (!json.week || !Array.isArray(json.overall) || !GAMES.every(game => Array.isArray(json.games?.[game.id]))) throw new Error('Invalid rankings');
      setData(json); setNow(Date.now());
    } catch { setError('We couldn’t refresh the leaderboard. Please try again.'); }
    finally { inFlight.current = false; setLoading(false); }
  }, []);
  useEffect(() => {
    void load();
    const refresh = () => { if (document.visibilityState === 'visible') { setNow(Date.now()); void load(); } };
    const interval = setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => { clearInterval(interval); window.removeEventListener('focus', refresh); };
  }, [load]);

  const entries: Entry[] = data ? activeTab === 'overall' ? data.overall : data.games[activeTab] : [];
  const viewer: Entry | null = data?.viewer ? activeTab === 'overall' ? data.viewer.overall : data.viewer.games[activeTab] : null;
  const totalPlayers = data?.totalPlayers?.[activeTab] ?? entries.length;
  const activeGame = GAMES.find(game => game.id === activeTab);
  const playUrl = activeGame?.route || '/game-hub';
  const playLabel = activeGame ? `Play ${activeGame.name}` : 'Choose a challenge';
  const PlayIcon = tabs.find(tab => tab.id === activeTab)!.Icon;
  const matches = entries.filter(entry => entry.displayName.toLowerCase().includes(query.trim().toLowerCase()) && (track === 'all' || department(entry.department) === track));
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const shown = matches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pinViewer = viewer && !shown.some(entry => entry.userId === viewer.userId) && !query && track === 'all';
  const target = viewer && viewer.rank > 10 ? entries.find(entry => entry.rank === 10) : viewer && viewer.rank > 1 ? entries.find(entry => entry.rank === viewer.rank - 1) : null;
  const gap = target && viewer ? Math.max(0, score(target) - score(viewer) + 1) : null;
  const progress = viewer && target ? Math.min(100, score(viewer) / Math.max(1, score(target) + 1) * 100) : viewer ? 100 : 0;
  const podium = [entries[1], entries[0], entries[2]].filter((entry): entry is Entry => !!entry);
  const switchTab = (id: TabId) => { setActiveTab(id); setPage(1); };

  function renderRow(entry: Entry) {
    const isYou = entry.userId === data?.viewer?.userId;
    return <tr key={entry.userId} data-podium={entry.rank <= 3} data-leader={entry.rank === 1} className={isYou ? styles.youRow : undefined}>
      <td><Rank rank={entry.rank} /></td>
      <td><div className={styles.contender}><Avatar entry={entry} /><div><strong>{entry.displayName}{isYou && ' (You)'}{(isYou || entry.rank === 1) && <span className={styles.nameBadge}>{isYou ? 'You' : 'Ace'}</span>}</strong><span>{trackName(entry.department)}</span></div></div></td>
      <td><span className={styles.statPill}>{'breakdown' in entry ? entry.breakdown['time-attack'].toLocaleString() : entry.correctAnswers ?? '—'}</span></td>
      <td>{'breakdown' in entry ? entry.breakdown['sudden-death'].toLocaleString() : entry.averageSeconds != null ? `${entry.averageSeconds.toFixed(1)}s / q` : '—'}</td>
      <td className={styles.accuracy}>{'breakdown' in entry ? entry.breakdown['scholars-wager'].toLocaleString() : entry.accuracy != null ? `${entry.accuracy.toFixed(1)}%` : '—'}</td>
      <td className={styles.tableScore}>{score(entry).toLocaleString()}</td>
      <td><span className={styles.statusPill} data-top={entry.rank <= 3}>{entry.rank === 1 ? 'Weekly leader' : entry.rank <= 3 ? 'Podium finish' : entry.rank <= 10 ? 'Top 10' : 'Ranked contender'}</span></td>
      <td>{isYou ? <Link className={styles.rowPlay} href={playUrl}>Play again</Link> : <span className={styles.achieved}>{dateLabel(entry.achievedAt)}</span>}</td>
    </tr>;
  }

  return <div className={styles.page} data-game={activeTab}>
    <StudentHeader displayName={data?.viewer?.overall?.displayName} weeklyScore={data?.viewer?.overall?.totalScore} />

    <main className={styles.main}>
      <section className={styles.hero}>
        <Link className={styles.back} href="/game-hub"><ArrowLeft size={13} />Back to Game Hub</Link>
        <h1>Weekly Leaderboard</h1>
        <p>Your highest completed score per challenge mode, combined for the<br className={styles.desktopBreak} /> ultimate weekly ranking.</p>
        <div className={styles.weekInfo}><span><i />Resets Mon 00:00 WAT (Nigeria)</span><b>·</b><span>Quit rounds do not count</span><b>·</b><span className={styles.countdown}><Hourglass size={12} />{data && now ? `${countdown(data.week.endsAt, now)} (${dateLabel(data.week.startsAt)} – ${dateLabel(data.week.endsAt)})` : 'A fresh challenge every week'}</span></div>
        <button className={styles.refresh} onClick={load} disabled={loading}><RefreshCw size={12} className={loading ? styles.spinning : ''} />{loading ? 'Refreshing rankings' : 'Refresh rankings'}</button>
      </section>

      <div className={styles.tabs} role="group" aria-label="Leaderboard game">{tabs.map(({ id, label, Icon }) => <button key={id} aria-pressed={activeTab === id} className={activeTab === id ? styles.selectedTab : ''} onClick={() => switchTab(id)}><Icon size={15} />{label}{activeTab === id && <span>LIVE</span>}</button>)}</div>
      {error && <div className={styles.error} role="alert">{error} <button onClick={load} disabled={loading}>Try again <ArrowRight size={13} /></button>{data && <small>Showing the last successful update from {dateLabel(data.generatedAt)}.</small>}</div>}
      {loading && !data ? <div className={styles.loading} role="status"><RefreshCw className={styles.spinning} size={22} /><p>Finding this week’s top scholars…</p></div> : data && <>
        <section className={styles.hall} aria-label="Top performers">
          <span className={styles.eyebrow}>Hall of academic excellence</span>
          <h2>{activeGame?.name || 'Overall'} Top Performers</h2>
          {podium.length ? <div className={styles.podium}>{podium.map(entry => <PodiumCard key={entry.userId} entry={entry} tab={activeTab} />)}</div> : <div className={styles.emptyPodium}><Trophy size={34} /><h3>The podium is waiting for you.</h3><p>Complete a round to claim the first spot this week.</p><Link href={playUrl}>Start a challenge <ArrowRight size={15} /></Link></div>}
        </section>

        <section className={styles.standing} aria-label="Your current standing">
          <Star className={styles.standingStar} size={178} fill="currentColor" strokeWidth={0} aria-hidden="true" />
          <div className={styles.standingIdentity}><div className={styles.rankTile}>{viewer && <span>TOP {Math.max(1, Math.ceil(viewer.rank / Math.max(1, totalPlayers) * 100))}%</span>}<strong>{viewer ? `#${viewer.rank}` : <Trophy size={26} />}</strong></div><div><p className={styles.standingLabel}>Your current standing <span>This week</span></p><h2>{viewer ? `${viewer.displayName} (You)` : 'Your place is on the board.'}{viewer?.department && <small>{trackName(viewer.department)}</small>}</h2><p>{viewer ? <>Weekly score: <b>{score(viewer).toLocaleString()} pts</b> · Ranked among {totalPlayers.toLocaleString()} contenders</> : 'Complete a round and set your first weekly score.'}</p></div></div>
          <div className={styles.gapCard}><div><span>{target ? viewer!.rank > 10 ? 'Gap to Top 10' : 'Your next rank' : viewer?.rank === 1 ? 'Leading the way' : viewer ? 'On the leaderboard' : 'A fresh start'}</span><strong>{gap !== null ? `${gap.toLocaleString()} pts needed` : viewer?.rank === 1 ? '#1 this week' : viewer ? 'Keep climbing' : 'Every point counts'}</strong></div><div className={styles.progress}><span style={{ width: `${progress}%` }} /></div><p>{target ? `Target: ${target.displayName} (#${target.rank} · ${score(target).toLocaleString()} pts)` : 'Your best completed round is the one that counts.'}</p></div>
          <Link href={playUrl} className={styles.playButton}><PlayIcon size={16} />{playLabel}</Link>
        </section>

        <section className={styles.rankings} aria-label="Contender rankings">
          <div className={styles.filters}><label className={styles.search}><Search size={15} /><input value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Search contender by name…" aria-label="Search contenders by name" />{query && <button onClick={() => { setQuery(''); setPage(1); }} aria-label="Clear search">×</button>}</label><div className={styles.tracks}><span>Track:</span>{tracks.map(item => <button key={item.id} aria-pressed={track === item.id} onClick={() => { setTrack(item.id); setPage(1); }}>{item.label}</button>)}</div></div>
          <div className={styles.tableCard}><div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Weekly rankings table, scroll horizontally on small screens"><table><thead><tr><th>Rank</th><th>Contender</th><th>{activeTab === 'overall' ? 'Time Attack' : activeTab === 'sudden-death' ? 'Best streak' : 'Correct'}</th><th>{activeTab === 'overall' ? 'Sudden Death' : 'Avg. time'}</th><th>{activeTab === 'overall' ? "Scholar’s Wager" : 'Accuracy'}</th><th>Points</th><th>Status</th><th>Achieved / action</th></tr></thead><tbody>{shown.map(renderRow)}{pinViewer && renderRow(viewer)}{!shown.length && <tr><td colSpan={8} className={styles.noMatches}>No contenders found{query || track !== 'all' ? '. Try another name or track.' : ' yet. Be the first to finish a round!'}</td></tr>}</tbody></table></div>
            <div className={styles.pagination}><p aria-live="polite">{matches.length ? `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, matches.length)} of ${matches.length}` : '0'} contenders{totalPlayers > entries.length && ` · Top ${entries.length} of ${totalPlayers.toLocaleString()} ranked`}</p><nav aria-label="Ranking pages"><button aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={13} /><span>Previous</span></button>{Array.from({ length: pageCount }, (_, index) => index + 1).filter(number => number === 1 || number === pageCount || Math.abs(number - currentPage) <= 1).map((number, index, visible) => <span key={number} className={styles.pageNumber}>{index > 0 && number - visible[index - 1] > 1 && <i>…</i>}<button aria-label={`Page ${number}`} aria-current={number === currentPage ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button></span>)}<button aria-label="Next page" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><span>Next</span><ChevronRight size={13} /></button></nav></div>
          </div>
        </section>
      </>}

      <section className={styles.infoCards} aria-label="How the leaderboard works"><article><h3><Trophy size={17} />Weekly scholar challenge</h3><strong className={styles.infoHighlight}>3 games. One leaderboard.</strong><p>Your best completed score in each game adds to your overall weekly points. Every new week is a fresh start.</p><footer><span>Play. Learn. Climb.</span><Link href="/game-hub">Explore games <ArrowRight size={12} /></Link></footer></article><article><h3><Info size={17} />Tie-breaker protocol</h3><strong>Chronological priority</strong><p>Equal scores are ordered by who achieved them first. Overall ties use the latest completion time among the contributing best rounds.</p><footer><span>{data ? `Last synced: ${new Date(data.generatedAt).toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' })} WAT` : 'Rankings refresh every minute'}</span></footer></article><article><h3><ShieldCheck size={17} />Fair play, verified scores</h3><strong>Every answer counts</strong><p>Answers and scores are checked on the server. Duplicate submissions are blocked, and timed rounds use a server-enforced deadline.</p><footer><span className={styles.verified}><i />Server-validated scoring</span></footer></article></section>
    </main>
    <footer className={styles.footer}><div><p><strong>BJOT Game Hub</strong><span>•</span>© {new Date().getFullYear()} BlastJamb Technologies Nigeria.</p><nav aria-label="Footer navigation"><Link href="/game-hub">Game Hub</Link><Link href="/game-hub/history">My game history</Link><Link href="/support">Support & help</Link></nav></div></footer>
  </div>;
}
