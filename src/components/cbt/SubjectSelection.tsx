import { Check, CircleAlert, Loader2, Sparkles } from 'lucide-react';
import { CbtQuestionSet } from './types';

interface SubjectSelectionProps {
  questionSets: CbtQuestionSet[];
  selectedIds: string[];
  maxSubjects: number;
  loading: boolean;
  onToggle: (id: string) => void;
  onStart: () => void;
}

export default function SubjectSelection({
  questionSets, selectedIds, maxSubjects, loading, onToggle, onStart,
}: SubjectSelectionProps) {
  const ready = selectedIds.length === maxSubjects;

  return (
    <main className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:py-10">
      <section className="rounded-xl border border-[#dce5df] bg-white p-5 shadow-[0_4px_16px_rgba(13,59,46,0.05)] sm:p-7">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf3ed] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#15513e]"><Sparkles size={12} />CBT SIMULATOR</span>
        <h1 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#17231e]">Build your mock exam</h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-[#64726a]">Choose four subjects. We will create a timed CBT simulation based on your selections.</p>

        {loading ? (
          <div className="grid min-h-64 place-items-center text-sm text-[#64726a]"><Loader2 className="mb-2 animate-spin text-[#15513e]" />Loading subjects…</div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {questionSets.map((questionSet) => {
              const selected = selectedIds.includes(questionSet._id);
              const disabled = !selected && selectedIds.length >= maxSubjects;
              return (
                <button
                  key={questionSet._id}
                  onClick={() => onToggle(questionSet._id)}
                  disabled={disabled}
                  className={`relative rounded-lg border p-4 text-left transition ${selected ? 'border-[#0d3b2e] bg-[#edf7f0] text-[#0d3b2e]' : disabled ? 'cursor-not-allowed border-[#e6ece8] bg-[#f8faf9] text-[#9aa59e]' : 'border-[#dce5df] bg-white text-[#17231e] hover:border-[#a8c2b1] hover:bg-[#f8fbf9]'}`}
                >
                  <span className="block text-sm font-extrabold">{questionSet.title}</span>
                  <span className="mt-1 block text-[11px] text-[#718078]">{questionSet.questionCount} questions · {questionSet.totalPoints} marks</span>
                  {selected && <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-[#0d3b2e] text-white"><Check size={13} /></span>}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <aside className="flex flex-col rounded-xl bg-[#0d3b2e] p-5 text-white shadow-[0_8px_24px_rgba(13,59,46,0.14)] sm:p-7">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#b9d2c4]">Simulator setup</p>
        <div className="mt-5 grid size-20 place-items-center rounded-full border-4 border-[#efb948] text-center"><strong className="text-2xl">{selectedIds.length}</strong><small className="text-[9px] uppercase text-[#b9d2c4]">of {maxSubjects}</small></div>
        <h2 className="mt-5 text-lg font-black">Your subject combination</h2>
        <div className="mt-3 space-y-2">
          {Array.from({ length: maxSubjects }, (_, index) => {
            const selected = questionSets.find((item) => item._id === selectedIds[index]);
            return <div key={index} className="flex min-h-10 items-center gap-3 rounded-md bg-white/10 px-3 text-xs"><span className="grid size-5 place-items-center rounded-full bg-[#efb948] text-[10px] font-black text-[#0d3b2e]">{index + 1}</span>{selected?.title || 'Choose a subject'}</div>;
          })}
        </div>
        <div className="mt-auto pt-6">
          {!ready && <p className="mb-3 flex items-center gap-2 text-xs text-[#d8e6de]"><CircleAlert size={15} />Select {maxSubjects - selectedIds.length} more subject{maxSubjects - selectedIds.length === 1 ? '' : 's'} to continue.</p>}
          <button onClick={onStart} disabled={!ready || loading} className="flex w-full items-center justify-center gap-2 rounded-md bg-[#efb948] px-4 py-3 text-sm font-black text-[#163329] transition hover:bg-[#f8cc70] disabled:cursor-not-allowed disabled:bg-[#557565] disabled:text-[#d6e0da]">
           {loading ? 'Preparing exam…' : 'Start CBT Exam'}
          </button>
        </div>
      </aside>
    </main>
  );
}
