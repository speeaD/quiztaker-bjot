export type SubjectScore = {
  subjectId: string;
  subjectTitle: string;
  score: number;
  totalPoints: number;
  percentage: number;
  scoreOutOf100?: number;
};

export type ExamResult = {
  score: number;
  totalPoints: number;
  percentage: number;
  timeTaken?: number;
  subjectScores?: SubjectScore[];
  scoreOutOf400?: number;
};

export const resultScore = (result: ExamResult) => result.scoreOutOf400 === undefined
  ? `${result.score}/${result.totalPoints}` : `${result.scoreOutOf400}/400`;

export const resultPercentage = (result: ExamResult) => result.scoreOutOf400 === undefined
  ? result.percentage : Math.round(result.scoreOutOf400 / 400 * 10000) / 100;

function elapsedTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return `${hours ? `${hours}h ` : ''}${minutes}m ${total % 60}s`;
}

export default function ResultSummary({ result }: { result: ExamResult }) {
  const multiSubject = result.scoreOutOf400 !== undefined;
  return (
    <div className="mt-6">
      <dl className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
        {[
          [multiSubject ? 'Total score' : 'Your score', resultScore(result)],
          ['Percentage', `${resultPercentage(result)}%`],
          ['Time taken', result.timeTaken === undefined ? 'Unavailable' : elapsedTime(result.timeTaken)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-[#edf3ef] p-4">
            <dt className="text-xs text-[#64726a]">{label}</dt>
            <dd className="mt-1 text-2xl font-bold text-[#0d3b2e]">{value}</dd>
          </div>
        ))}
      </dl>
      {!!result.subjectScores?.length && (
        <table className="mt-6 w-full text-left text-sm">
          <caption className="mb-3 text-left font-bold text-[#17231e]">Individual subject scores</caption>
          <thead className="border-b border-[#dce5df] text-xs text-[#64726a]">
            <tr><th scope="col" className="py-2 pr-2">Subject</th><th scope="col" className="px-2 py-2 text-right">Score{multiSubject ? ' (out of 100)' : ''}</th>{!multiSubject && <th scope="col" className="py-2 pl-2 text-right">%</th>}</tr>
          </thead>
          <tbody>
            {result.subjectScores.map((subject) => (
              <tr key={subject.subjectId} className="border-b border-[#e7eee9]">
                <th scope="row" className="py-3 pr-2 font-semibold text-[#17231e]">{subject.subjectTitle}</th>
                <td className="px-2 py-3 text-right font-bold text-[#0d3b2e]">{multiSubject ? `${subject.scoreOutOf100}/100` : `${subject.score}/${subject.totalPoints}`}</td>
                {!multiSubject && <td className="py-3 pl-2 text-right text-[#64726a]">{subject.percentage}%</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
