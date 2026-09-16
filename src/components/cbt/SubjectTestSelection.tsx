import { Check, Clock3, Loader2, Target } from 'lucide-react';
import { CbtQuestionSet } from './types';

interface SubjectTestSelectionProps {
  questionSets: CbtQuestionSet[];
  selectedId: string;
  loading: boolean;
  error: string;
  onSelect: (id: string) => void;
  onStart: () => void;
}

export default function SubjectTestSelection({
  questionSets, selectedId, loading, error, onSelect, onStart,
}: SubjectTestSelectionProps) {
  const selected = questionSets.find((item) => item._id === selectedId);

  return (
    <main className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:py-10">
      <section className="rounded-xl border border-[#dce5df] bg-white p-5 shadow-[0_4px_16px_rgba(13,59,46,0.05)] sm:p-7">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff2d1] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#9a5a00]"><Target size={12} />Deep practice</span>
        <h1 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#17231e]">Choose a subject to master</h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-[#64726a]">Build a focused 40-question test, then use your result to target the next topic to improve.</p>
        {error && <p className="mt-5 rounded-lg border border-[#f3c7b5] bg-[#fff0ec] px-3 py-2 text-xs font-bold text-[#a8451f]">{error}</p>}
        {loading ? <div className="grid min-h-64 place-items-center text-sm text-[#64726a]"><Loader2 className="mb-2 animate-spin text-[#9a5a00]" />Loading subjects…</div> : <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {questionSets.map((questionSet) => {
            const isSelected = selectedId === questionSet._id;
            return <button key={questionSet._id} onClick={() => onSelect(questionSet._id)} className={`relative rounded-lg border p-4 text-left transition ${isSelected ? 'border-[#0d3b2e] bg-[#edf7f0] text-[#0d3b2e]' : 'border-[#dce5df] bg-white text-[#17231e] hover:border-[#a8c2b1] hover:bg-[#f8fbf9]'}`}>
              <span className="block text-sm font-extrabold">{questionSet.title}</span>
              <span className="mt-1 block text-[11px] text-[#718078]">{questionSet.questionCount} questions · {questionSet.totalPoints} marks</span>
              {isSelected && <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-[#0d3b2e] text-white"><Check size={13} /></span>}
            </button>;
          })}
        </div>}
      </section>
      <aside className="flex flex-col rounded-xl bg-[#0d3b2e] p-5 text-white shadow-[0_8px_24px_rgba(13,59,46,0.14)] sm:p-7">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#b9d2c4]">Subject test</p>
        <span className="mt-5 grid size-14 place-items-center rounded-lg bg-[#efb948] text-[#0d3b2e]"><Clock3 size={25} /></span>
        <h2 className="mt-5 text-lg font-black">{selected ? selected.title : 'Your focused practice'}</h2>
        <p className="mt-2 text-xs leading-5 text-[#d8e6de]">{selected ? 'Your test includes up to 40 randomly ordered questions and a one-hour timer.' : 'Select a subject to see your focused test details.'}</p>
        <div className="mt-5 rounded-lg bg-white/10 p-3 text-xs"><span className="block text-[#b9d2c4]">Test duration</span><strong className="mt-1 block">1 hour · 40 questions</strong></div>
        <button onClick={onStart} disabled={!selectedId || loading} className="mt-auto pt-6 disabled:cursor-not-allowed disabled:opacity-50"><span className="flex w-full items-center justify-center rounded-md bg-[#efb948] px-4 py-3 text-sm font-black text-[#163329] transition hover:bg-[#f8cc70]">Start Subject Test</span></button>
      </aside>
    </main>
  );
}
