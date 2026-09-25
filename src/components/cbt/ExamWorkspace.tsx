import { ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';
import { CbtQuestion, CbtQuestionSet } from './types';

interface ExamWorkspaceProps {
  questionSets: CbtQuestionSet[];
  selectedIds: string[];
  questionsBySet: Record<string, CbtQuestion[]>;
  currentSetIndex: number;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  currentQuestion: CbtQuestion | null;
  currentGlobalIndex: number;
  totalQuestions: number;
  onSubjectChange: (index: number) => void;
  onQuestionChange: (index: number) => void;
  onAnswer: (answer: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function ExamWorkspace({
  questionSets, selectedIds, questionsBySet, currentSetIndex, currentQuestionIndex, answers,
  currentQuestion, currentGlobalIndex, totalQuestions, onSubjectChange, onQuestionChange, onAnswer, onPrevious, onNext,
}: ExamWorkspaceProps) {
  const activeSet = questionSets.find((item) => item._id === selectedIds[currentSetIndex]);
  const activeQuestions = questionsBySet[selectedIds[currentSetIndex]] || [];
  const isFirst = currentSetIndex === 0 && currentQuestionIndex === 0;
  const isLast = currentSetIndex === selectedIds.length - 1 && currentQuestionIndex === activeQuestions.length - 1;

  return (
    <>
      <div className="border-b border-[#dce5df] bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 sm:px-6">
          {selectedIds.map((id, index) => {
            const set = questionSets.find((item) => item._id === id);
            const answered = (questionsBySet[id] || []).filter((question) => answers[question._id]).length;
            return (
              <button key={id} onClick={() => onSubjectChange(index)} className={`shrink-0 border-b-2 px-4 py-3 text-xs font-bold transition ${currentSetIndex === index ? 'border-[#efb948] text-[#0d3b2e]' : 'border-transparent text-[#718078] hover:text-[#0d3b2e]'}`}>
                {set?.title}<span className="ml-2 rounded-full bg-[#edf3ef] px-1.5 py-0.5 text-[10px]">{answered}/{(questionsBySet[id] || []).length}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:py-7">
        {currentQuestion && <section className="rounded-xl border border-[#dce5df] bg-white p-5 shadow-[0_4px_16px_rgba(13,59,46,0.05)] sm:p-7">
          <div className="flex items-center justify-between border-b border-[#e7eee9] pb-4 text-xs font-bold text-[#718078]">
            <span>{activeSet?.title}</span>
            <span>Question {currentGlobalIndex + 1} of {totalQuestions}</span>
          </div>
          <p className="mt-6 text-lg font-medium leading-8 text-[#17231e]">{currentQuestion.question}</p>
          {currentQuestion.passage && <p className="mt-4 whitespace-pre-wrap rounded-lg bg-[#f4f7f5] p-4 text-sm leading-6 text-[#293830]">{currentQuestion.passage}</p>}
          {currentQuestion.diagram && <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentQuestion.diagram} alt={currentQuestion.diagramAlt || 'Question diagram'} className="max-h-80 max-w-full rounded-lg object-contain" />
          </div>}
          <div className="mt-6 space-y-3">
            {(currentQuestion.type === 'fill-in-the-blank' || currentQuestion.type === 'fill-in-the-blanks') && <label className="block text-sm font-bold text-[#293830]">Your answer
              <input type="text" value={answers[currentQuestion._id] || ''} onChange={(event) => onAnswer(event.target.value)} className="mt-2 w-full rounded-lg border border-[#dce5df] bg-[#fbfcfb] p-4 font-normal" maxLength={1000} />
            </label>}
            {(currentQuestion.options || []).map((option, index) => {
              const selected = answers[currentQuestion._id] === option;
              return <button key={option} onClick={() => onAnswer(option)} className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition ${selected ? 'border-[#0d3b2e] bg-[#edf7f0]' : 'border-[#dce5df] bg-[#fbfcfb] hover:border-[#aac4b3] hover:bg-[#f4f8f5]'}`}>
                <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-black ${selected ? 'bg-[#0d3b2e] text-white' : 'bg-[#e8efeb] text-[#476056]'}`}>{String.fromCharCode(65 + index)}</span>
                <span className="pt-0.5 text-sm leading-6 text-[#293830]">{option}</span>
              </button>;
            })}
          </div>
          <div className="mt-7 flex items-center justify-between border-t border-[#e7eee9] pt-4">
            <button onClick={onPrevious} disabled={isFirst} className="inline-flex items-center gap-2 rounded-md border border-[#c9d8cf] px-4 py-2.5 text-xs font-bold text-[#15513e] hover:bg-[#edf3ef] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={15} />Previous</button>
            <button onClick={onNext} disabled={isLast} className="inline-flex items-center gap-2 rounded-md bg-[#0d3b2e] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#14513c] disabled:cursor-not-allowed disabled:opacity-40">Next<ChevronRight size={15} /></button>
          </div>
        </section>}
        <aside className="rounded-xl border border-[#dce5df] bg-white p-4 shadow-[0_4px_16px_rgba(13,59,46,0.05)] lg:h-fit">
          <div className="flex items-center gap-2 text-xs font-black"><Clock3 size={15} className="text-[#a5660c]" />Question navigator</div>
          <p className="mt-1 text-[11px] leading-4 text-[#718078]">Answered questions are marked in green.</p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {activeQuestions.map((question, index) => <button key={question._id} onClick={() => onQuestionChange(index)} className={`grid size-8 place-items-center rounded-md text-[10px] font-black ${index === currentQuestionIndex ? 'bg-[#0d3b2e] text-white' : answers[question._id] ? 'bg-[#dcebe1] text-[#15513e]' : 'bg-[#edf3ef] text-[#64726a]'}`}>{index + 1}</button>)}
          </div>
        </aside>
      </main>
    </>
  );
}
