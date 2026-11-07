'use client';

type Subject = { id: string; title: string; questionCount?: number };

export default function MockSubjectSelection({ subjects, selectedIds, englishId, onToggle, disabled = false }: {
  subjects: Subject[];
  selectedIds: string[];
  englishId?: string;
  onToggle: (id: string) => void;
  disabled?: boolean;
}) {
  return <fieldset disabled={disabled} className="my-6">
    <legend className="text-lg font-bold text-[#17231e]">Choose your subjects</legend>
    <p className="mt-1 text-sm text-[#64726a]">English is compulsory. Select three other subjects. Your choices are locked when the exam starts.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {subjects.map((subject) => {
        const compulsory = subject.id === englishId;
        const selected = selectedIds.includes(subject.id);
        return <label key={subject.id} className={`flex items-center gap-3 rounded-lg border p-4 text-sm ${selected ? 'border-[#15513e] bg-[#edf7f0]' : 'border-[#dce5df] bg-white'}`}>
          <input type="checkbox" checked={selected} disabled={compulsory || (!selected && selectedIds.length >= 4)} onChange={() => onToggle(subject.id)} className="size-4 accent-[#15513e]" />
          <span><strong className="block">{subject.title}{compulsory ? ' (compulsory)' : ''}</strong>{subject.questionCount !== undefined && <span className="text-xs text-[#64726a]">{subject.questionCount} questions</span>}</span>
        </label>;
      })}
    </div>
    <p aria-live="polite" className="mt-3 text-sm font-semibold text-[#15513e]">{selectedIds.length} of 4 subjects selected</p>
    {!englishId && <p role="alert" className="mt-2 text-sm text-red-700">English is unavailable in this mock. Please contact your administrator.</p>}
  </fieldset>;
}
