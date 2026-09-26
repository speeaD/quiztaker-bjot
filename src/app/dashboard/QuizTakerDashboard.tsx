'use client';

import {
  AlertCircle, Award, BookOpen, Calendar, CheckCircle2, Clock3, Gamepad2,
  History, Loader2, Lock, Play, Target, TrendingUp, Trophy,
  UserCheck, X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import PortalLogo from '@/components/PortalLogo';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

interface Submission {
  id: string; quizTitle: string; score: number; totalPoints: number; percentage: number;
  completedAt: string; examType?: 'single-subject' | 'multi-subject'; type?: 'mock' | 'cbt' | 'study';
}
interface AssignedQuiz {
  _id: string;
  quizId: { _id: string; settings: { title: string; duration?: { hours: number; minutes: number; seconds: number } } };
  status: 'pending' | 'in-progress' | 'completed';
  assignedAt: string;
  submissionId?: { _id: string; score: number; totalPoints: number; percentage: number };
}
type Filter = 'all' | 'pending' | 'in-progress' | 'completed';

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatDuration = (value?: { hours: number; minutes: number; seconds: number }) => !value ? 'Flexible time' : value.hours ? `${value.hours}h ${value.minutes}m` : `${value.minutes}m`;
const initials = (value: string) => value.split(/[ @._-]/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'ST';
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

function LearningCard({ title, description, action, href, icon: Icon, accent = 'emerald', badge, locked = false }: {
  title: string; description: string; action: string; href: string; icon: typeof Target;
  accent?: 'emerald' | 'gold' | 'orange'; badge?: string; locked?: boolean;
}) {
  const accents = { emerald: 'bg-[#e5f0eb] text-[#0d3b2e]', gold: 'bg-[#fff2d1] text-[#9a5a00]', orange: 'bg-[#fff0e4] text-[#c64d08]' };
  return (
    <article className="portal-card portal-card--raised group relative flex min-h-[220px] flex-col p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className={`grid size-9 place-items-center rounded-lg ${accents[accent]}`}><Icon size={18} strokeWidth={1.8} /></span>
        {badge && <span className="rounded-full bg-[#eaf3ed] px-2 py-1 text-[0.690625rem] font-bold text-[#15513e]">{badge}</span>}
        {locked && <Lock size={15} className="text-[#89968f]" />}
      </div>
      <h3 className="text-[0.966875rem] font-extrabold tracking-[-0.02em] text-[#17231e]">{title}</h3>
      <p className="mt-2 text-[0.82875rem] leading-[1.38125rem] text-[#64726a]">{description}</p>
      <Link href={locked ? '#' : href} className="mt-auto flex items-center justify-between rounded-md bg-[#edf3ef] px-3 py-2 text-[0.7596875rem] font-bold text-[#113c2e] transition group-hover:bg-[#dcebe1]" aria-disabled={locked}>
        {action}<span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

export default function QuizTakerDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [focusTopic, setFocusTopic] = useState<{ id: string; title: string; averagePercentage: number; attempts: number } | null>(null);
  const [assignedQuizzes, setAssignedQuizzes] = useState<AssignedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignedLoading, setAssignedLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignedError, setAssignedError] = useState('');
  const [submitNotification, setSubmitNotification] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const email = typeof window !== 'undefined' ? localStorage.getItem('quizTakerEmail') || 'Student' : 'Student';
  const greeting = getGreeting();

  const fetchSubmissions = async () => {
    try {
      setLoading(true); setError('');
      const response = await fetch('/api/quiztaker/analytics');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load your exam history');
      setSubmissions(data.success ? (data.results || []).map((item: { id: string; type: 'mock' | 'cbt' | 'study'; title: string; score: number; totalPoints: number; percentage: number; completedAt: string }) => ({ ...item, quizTitle: item.title })) : []);
      setFocusTopic(data.summary?.focusTopic || null);
      if (!data.success) setError(data.message || 'No submission history found');
    } catch (err) {
      setSubmissions([]); setFocusTopic(null); setError(err instanceof Error ? err.message : 'Unable to load your exam history');
    } finally { setLoading(false); }
  };

  const fetchAssignedQuizzes = async () => {
    try {
      setAssignedLoading(true); setAssignedError('');
      const response = await fetch('/api/quiztaker/dashboard');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load assigned exams');
      setAssignedQuizzes(data.success ? data.quizTaker?.assignedQuizzes || [] : []);
    } catch (err) {
      setAssignedQuizzes([]); setAssignedError(err instanceof Error ? err.message : 'Unable to load assigned exams');
    } finally { setAssignedLoading(false); }
  };

  useEffect(() => {
    void fetchSubmissions(); void fetchAssignedQuizzes();
    const reason = sessionStorage.getItem('quizSubmitReason');
    if (reason) { setSubmitNotification(reason); sessionStorage.removeItem('quizSubmitReason'); }
  }, []);

  const totalExams = submissions.length;
  const studyCount = submissions.filter((item) => item.type === 'study').length;
  const cbtCount = submissions.filter((item) => item.type === 'cbt').length;
  const mockCount = submissions.filter((item) => item.type === 'mock').length;
  const averageScore = totalExams ? Math.round(submissions.reduce((sum, item) => sum + item.percentage, 0) / totalExams) : 0;
  const highestScore = totalExams ? Math.max(...submissions.map((item) => item.percentage)) : 0;
  const readiness = totalExams ? Math.min(95, Math.max(18, Math.round((averageScore + Math.min(totalExams * 4, 25)) / 1.2))) : 18;
  const pendingCount = assignedQuizzes.filter((item) => item.status === 'pending').length;
  const completedCount = assignedQuizzes.filter((item) => item.status === 'completed').length;

  const filteredAssignments = useMemo(() => {
    const priority = { 'in-progress': 0, pending: 1, completed: 2 };
    const sorted = [...assignedQuizzes].sort((a, b) => priority[a.status] - priority[b.status]);
    return filter === 'all' ? sorted : sorted.filter((item) => item.status === filter);
  }, [assignedQuizzes, filter]);

  const startQuiz = (quiz: AssignedQuiz) => { window.location.href = `/assigned-quiz/${quiz.quizId._id}`; };
  const viewResults = (id: string) => { window.location.href = `/results/${id}`; };
  return (
    <div className="portal-page text-[1.105rem] text-[#17231e]">
      <DashboardSidebar readiness={readiness} />

      <main className="dashboard-main mx-auto max-w-[1210px] px-4 py-4 lg:ml-64 lg:px-8 lg:py-5">
        <header className="flex items-center justify-between lg:mb-4">
          <div className="flex items-center gap-3 lg:hidden"><span className="grid"><PortalLogo size={90} priority /></span></div>
          <div className="hidden lg:block"><p className="text-[0.690625rem] font-extrabold uppercase tracking-[0.16em] text-[#718078]">Student command centre</p><h1 className="mt-1 text-[1.6575rem] font-black tracking-[-0.04em]">Hello, {email.split('@')[0]}</h1></div>
          <div className="flex items-center gap-3"><span className="hidden text-right sm:block"><strong className="block text-[0.82875rem]">{email}</strong><small className="text-[0.690625rem] text-[#718078]">BJOT learner</small></span><span className="grid size-9 place-items-center rounded-full bg-[#dcebe1] text-[0.82875rem] font-black text-[#0d3b2e]">{initials(email)}</span></div>
        </header>

        {submitNotification && <div className="mb-3 flex items-start gap-3 rounded-lg border border-[#f1c779] bg-[#fff8e8] p-3 text-[0.966875rem] text-[#744700]"><AlertCircle size={18} /><div className="flex-1"><strong className="block text-[0.82875rem]">Quiz auto-submitted</strong>{submitNotification}</div><button onClick={() => setSubmitNotification(null)} aria-label="Dismiss notification"><X size={17} /></button></div>}

        <section className="mb-6 grid gap-4 lg:grid-cols-[1.65fr_.9fr]">
          <div className="rounded-xl border border-[#dce5df] bg-white shadow-[0_2px_8px_rgba(13,59,46,0.04)] p-5 sm:p-6">
            <span className="inline-flex rounded-full border border-[#c8dbce] bg-[#f1f7f3] px-2.5 py-1 text-[0.690625rem] font-extrabold uppercase tracking-wide text-[#18533d]">PREMIUM STUDENT (september cohort)</span>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-[1.38125rem] font-black tracking-[-0.035em]">{greeting}, {email.split('@')[0]}.</h2><p className="mt-1 max-w-lg text-[0.82875rem] leading-[1.38125rem] text-[#65736a]">Stay consistent with focused practice. Your dashboard keeps your next best learning action within reach.</p></div><Link href="/cbt-simulator" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#0d3b2e] px-4 py-2.5 text-[0.82875rem] font-bold text-white transition hover:bg-[#14513c]"><Play size={14} fill="currentColor" />Resume CBT mock</Link></div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#e7eee9] pt-4 sm:grid-cols-4">
              {([['Study tests', String(studyCount), Trophy], ['Tests done', String(totalExams), CheckCircle2], ['Overall score', `${averageScore}%`, TrendingUp], ['Best score', `${highestScore}%`, Award]] as const).map(([label, value, Icon]) => <div key={label} className="flex gap-2"><span className="grid size-8 place-items-center rounded-md bg-[#edf3ef] text-[#15513e]"><Icon size={14} /></span><span><b className="block text-[0.82875rem]">{value}</b><small className="block text-[0.690625rem] leading-[1.105rem] text-[#718078]">{label}</small></span></div>)}
            </div>
          </div>
          <div className="rounded-xl bg-[#0d3b2e] p-5 text-white shadow-[0_8px_24px_rgba(13,59,46,0.16)]">
            <p className="text-[0.690625rem] font-bold uppercase tracking-[0.15em] text-[#b9d2c4]">Projected readiness</p>
            <div className="mt-4 flex items-center gap-5">
              <div
                className="grid size-24 place-items-center rounded-full border-4 border-[#efb948]"
                style={{ background: `conic-gradient(#efb948 ${readiness * 3.6}deg, #215641 0deg)` }}
              >
                <span className="grid size-[70px] place-items-center rounded-full bg-[#0d3b2e] text-center">
                  <b className="text-[1.38125rem] leading-none">{readiness}%</b>
                  <small className="mt-1 text-[0.5525rem] uppercase text-[#b9d2c4]">ready</small>
                </span>
              </div>
              <div>
                <p className="text-[0.7596875rem] text-[#b9d2c4]">Current average</p>
                <strong className="text-[1.6575rem]">{averageScore || '—'}%</strong>
                <p className="mt-2 text-[0.690625rem] text-[#d8e6de]">Complete a mock to refine your projection.</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#215641]">
              <div className="h-full rounded-full bg-[#efb948]" style={{ width: `${readiness}%` }} />
            </div>
          </div>
        </section>

        <section><div className="mb-3"><h2 className="text-[0.966875rem] font-black tracking-[-0.02em]">Core Learning Hubs</h2><p className="mt-0.5 text-[0.7596875rem] text-[#718078]">Select a simulator or interactive workspace.</p></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <LearningCard title="CBT Simulator" description="Full official exam mode with a timed four-subject mock." action="Start Mock (400 Marks)" href="/cbt-simulator" icon={Target} badge="Timed UTME" />
            <LearningCard title="Study Hub" description="Read topic lessons, watch videos, and take a focused topic test." action="Explore Study Hub" href="/study-hub" icon={BookOpen} badge="Study notes" />
            <LearningCard title="Subject Tests" description="Choose a topic and practise focused questions at your pace." action="Choose Topic & Drill" href="/subject-test" icon={Target} accent="orange" badge="Deep practice" />
            <LearningCard title="Game Hub" description="Sharpen recall with quick rounds, challenges, and timed games." action="Enter Battle Arena" href="/game-hub" icon={Gamepad2} accent="gold" badge="Live arena" />
            <LearningCard title="Attendance & Check-in" description="Mark attendance and keep your learning streak active." action="Check In Today" href="/todays-class" icon={UserCheck} badge="+50 XP" />
            <LearningCard title="Class Schedule" description="View live sessions, upcoming classes, and past session notes." action="View Timetable" href="/schedule" icon={Calendar} badge="This week" />
          </div>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,.8fr)]">
          <div className="rounded-xl border border-[#dce5df] bg-white p-4 shadow-[0_2px_8px_rgba(13,59,46,0.04)] sm:p-5">
            <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><History size={16} className="text-[#15513e]" /><h2 className="text-[0.966875rem] font-black">Recent Results</h2><span className="text-[0.690625rem] text-[#718078]">{mockCount} mock · {cbtCount} CBT · {studyCount} study</span></div><button onClick={() => void fetchSubmissions()} className="text-[0.7596875rem] font-bold text-[#15513e] hover:underline">Refresh</button></div>
            {loading ? <div className="grid place-items-center py-12 text-[0.82875rem] text-[#718078]"><Loader2 className="mb-2 animate-spin text-[#15513e]" />Loading exam history…</div> : error ? <div className="py-10 text-center text-[0.82875rem] text-[#718078]"><AlertCircle className="mx-auto mb-2 text-[#b85b26]" />{error}</div> : submissions.length === 0 ? <div className="py-10 text-center text-[0.82875rem] text-[#718078]">No results yet. Complete a mock, CBT practice, or topic test to start tracking progress.</div> : <div className="space-y-2">{submissions.slice(0, 4).map((submission) => <article key={submission.id} className="flex flex-col gap-3 rounded-lg border border-[#e0e8e2] bg-[#f9fbfa] p-3 sm:flex-row sm:items-center"><span className="grid size-9 place-items-center rounded-md bg-[#e5f0eb] text-[#15513e]"><Award size={16} /></span><div className="min-w-0 flex-1"><h3 className="truncate text-[0.82875rem] font-extrabold">{submission.quizTitle}</h3><p className="mt-1 text-[0.690625rem] text-[#718078]">{formatDate(submission.completedAt)} · {submission.type === 'study' ? 'Study topic' : submission.type === 'cbt' ? 'CBT practice' : submission.examType === 'single-subject' ? 'Single subject' : 'Mock exam'}</p></div><div className="flex items-center justify-between gap-3 sm:justify-end"><span className="text-right"><b className="block text-[0.966875rem] text-[#0d3b2e]">{submission.percentage}%</b><small className="text-[0.690625rem] text-[#718078]">{submission.score}/{submission.totalPoints}</small></span>{submission.type === 'study' ? <Link href={`/study-hub/attempts/${submission.id}`} className="rounded-md border border-[#c9d8cf] px-2.5 py-1.5 text-[0.690625rem] font-bold text-[#15513e] hover:bg-[#edf3ef]">Result</Link> : submission.type !== 'cbt' ? <button onClick={() => viewResults(submission.id)} className="rounded-md border border-[#c9d8cf] px-2.5 py-1.5 text-[0.690625rem] font-bold text-[#15513e] hover:bg-[#edf3ef]">Breakdown</button> : null}</div></article>)}</div>}
          </div>
          <aside className="space-y-4">
            <section className="rounded-xl border border-[#dce5df] bg-white p-4 shadow-[0_2px_8px_rgba(13,59,46,0.04)]">
              <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><Calendar size={16} className="text-[#c64d08]" /><h2 className="text-[0.966875rem] font-black">Assigned Exams</h2></div><span className="rounded-full bg-[#fff2d1] px-2 py-1 text-[0.690625rem] font-bold text-[#9a5a00]">{pendingCount} pending</span></div>
              <div className="mb-3 flex gap-1 overflow-auto">{(['all', 'pending', 'in-progress', 'completed'] as Filter[]).map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-md px-2 py-1 text-[0.690625rem] font-bold capitalize ${filter === item ? 'bg-[#0d3b2e] text-white' : 'bg-[#edf3ef] text-[#5c6a62]'}`}>{item === 'in-progress' ? 'Active' : item}</button>)}</div>
              {assignedLoading ? <div className="grid place-items-center py-8"><Loader2 className="animate-spin text-[#15513e]" size={20} /></div> : assignedError ? <button onClick={() => void fetchAssignedQuizzes()} className="w-full rounded-md bg-[#fff1ed] p-3 text-[0.82875rem] text-[#b85b26]">{assignedError} — Retry</button> : filteredAssignments.length === 0 ? <p className="py-6 text-center text-[0.82875rem] text-[#718078]">No exams in this view.</p> : <div className="space-y-2">{filteredAssignments.slice(0, 3).map((quiz) => <article key={quiz._id} className="rounded-lg bg-[#f2f6f3] p-3"><div className="flex items-start justify-between gap-2"><h3 className="text-[0.82875rem] font-extrabold leading-[1.105rem]">{quiz.quizId.settings.title || 'Untitled quiz'}</h3><span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[0.6215625rem] font-bold ${quiz.status === 'completed' ? 'bg-[#d8eee0] text-[#236b46]' : quiz.status === 'in-progress' ? 'bg-[#e4edf7] text-[#25609a]' : 'bg-[#fff0db] text-[#9a5a00]'}`}>{quiz.status === 'in-progress' ? 'Active' : quiz.status}</span></div><p className="mt-2 flex items-center gap-1 text-[0.690625rem] text-[#718078]"><Clock3 size={11} />{formatDuration(quiz.quizId.settings.duration)}</p>{quiz.status === 'completed' && quiz.submissionId ? <button onClick={() => viewResults(quiz.submissionId!._id)} className="mt-3 w-full rounded-md border border-[#c9d8cf] py-1.5 text-[0.690625rem] font-bold text-[#15513e]">View Results</button> : <button onClick={() => startQuiz(quiz)} className="mt-3 flex w-full items-center justify-center gap-1 rounded-md bg-[#0d3b2e] py-1.5 text-[0.690625rem] font-bold text-white"><Play size={11} fill="currentColor" />{quiz.status === 'in-progress' ? 'Continue Exam' : 'Start Exam'}</button>}</article>)}</div>}
            </section>
            <section className="rounded-xl border border-[#dce5df] bg-white p-4 shadow-[0_2px_8px_rgba(13,59,46,0.04)]"><div className="flex items-center gap-2"><TrendingUp size={16} className="text-[#c64d08]" /><h2 className="text-[0.966875rem] font-black">Focus Recommendation</h2></div><div className="mt-3 rounded-lg border border-[#f2dca7] bg-[#fff9ea] p-3"><p className="text-[0.690625rem] font-bold uppercase tracking-wide text-[#a3660a]">Next best action</p><p className="mt-1 text-[0.82875rem] font-extrabold">{focusTopic ? `Review ${focusTopic.title}` : 'Take a timed CBT simulation'}</p><p className="mt-1 text-[0.690625rem] leading-[1.105rem] text-[#6f634d]">{focusTopic ? `Your average across ${focusTopic.attempts} topic test${focusTopic.attempts === 1 ? '' : 's'} is ${focusTopic.averagePercentage}%. Review the lesson and try another set of questions.` : 'One full mock will give you a clearer score projection and reveal where to focus next.'}</p><Link href={focusTopic ? `/study-hub/${focusTopic.id}` : '/cbt-simulator'} className="mt-3 inline-flex text-[0.690625rem] font-black text-[#15513e] hover:underline">{focusTopic ? 'Review topic →' : 'Start CBT practice →'}</Link></div><p className="mt-3 text-[0.690625rem] text-[#718078]">{completedCount} assigned exam{completedCount === 1 ? '' : 's'} completed so far.</p></section>
          </aside>
        </section>
      </main>
    </div>
  );
}
