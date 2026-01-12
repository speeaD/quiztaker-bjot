'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Award,
  Target,
} from 'lucide-react';

interface SubmissionAnswer {
  question: string;
  type: string;
  yourAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsAwarded: number;
  pointsPossible: number;
}

interface SubmissionData {
  id: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeTaken: number;
  submittedAt: string;
  status: string;
  feedback: string;
  answers: SubmissionAnswer[];
  quizTitle?: string;
}

interface ResultsResponse {
  success: boolean;
  submission: SubmissionData;
}

// Meme configuration based on performance
const getMemeByPerformance = (percentage: number): { src: string; alt: string } => {
  let memes: string[] = [];
  if (percentage >= 95) {
      memes = ['95-100.jpg']
  } else if (percentage >= 90) {
    memes = ['90-95.jpg'];
  } else if (percentage >= 80) {
    memes = ['good.jpg'];
  } else if (percentage >= 75) {
    memes = ['75-80.jpg'];
  } else if (percentage >= 65) {
    memes = ['65-75.jpg'];
  } else if (percentage >= 50) {
    memes = ['50-65.jpg'];
  }
   else {
    memes = ['/memes/0-40.jpg', '/memes/0-40-1.jpg', '/memes/0-40-2.jpg'];
  }
  const randomMeme = memes[Math.floor(Math.random() * memes.length)];
  return {
    src: `/memes/${randomMeme}`,
    alt: 'Performance meme'
  };
};

const ResultsPageComponent = () => {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SubmissionData | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/quiztaker/submission/${submissionId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }

        const data: ResultsResponse = await response.json();
        setResults(data.submission);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchResults();
    }
  }, [submissionId]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))] mx-auto"></div>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <XCircle size={48} className="text-[hsl(var(--destructive))] mx-auto mb-4" />
          <p className="text-[hsl(var(--muted-foreground))] mb-4">{error || 'Failed to load results'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const correctAnswers = results.answers.filter(a => a.isCorrect).length;
  const percentage = results.percentage;
  const meme = getMemeByPerformance(percentage);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">Quiz Results</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Your quiz has been graded for {results.quizTitle || 'English Mock'}.
          </p>
        </div>

        {/* Score Card with Gradient */}
        <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-purple-200 rounded-3xl p-8 mb-8 shadow-lg relative overflow-hidden">
          {/* Meme Illustration */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40">
            <Image
              src='/help.webp'
              alt={meme.alt}
              width={160}
              height={160}
              className="object-contain w-full h-full"
            />
          </div>

          <div className="flex items-center gap-8 mb-8">
            {/* Circular Progress */}
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="hsl(217, 91%, 60%)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - percentage / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-[hsl(var(--primary))]">{percentage}%</span>
              </div>
            </div>

            {/* Score Text */}
            <div>
              <h2 className="text-5xl font-bold text-[hsl(var(--foreground))] mb-2">{percentage}%</h2>
              <p className="text-lg text-[hsl(var(--foreground))] opacity-70">Your Score</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-[hsl(var(--primary))]" size={20} />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Score</p>
              </div>
              <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                {results.score}/{results.totalPoints}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-600" size={20} />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Correct</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {correctAnswers}/{results.answers.length}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-[hsl(var(--primary))]" size={20} />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Time Spent</p>
              </div>
              <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                {formatTime(results.timeTaken)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Award className="text-purple-600" size={20} />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Status</p>
              </div>
              <p className="text-sm font-bold text-purple-600">
                {results.status === 'auto-graded' ? 'Auto Graded' : results.status.replace('-', ' ')}
              </p>
            </div>
          </div>

          {results.feedback && (
            <div className="mt-6 bg-white/80 backdrop-blur rounded-xl p-4">
              <p className="text-sm font-semibold text-[hsl(var(--primary))] mb-2">Feedback:</p>
              <p className="text-[hsl(var(--foreground))]">{results.feedback}</p>
            </div>
          )}
        </div>

        {/* Detailed Results */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">Detailed Results</h2>
          {results.answers.map((result: SubmissionAnswer, index: number) => (
            <div
              key={index}
              className="bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-[hsl(var(--border))] p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] text-sm font-semibold px-3 py-1 rounded-lg">
                      Question {index + 1}
                    </span>
                    <span className="text-[hsl(var(--muted-foreground))] text-sm">
                      {result.pointsPossible} {result.pointsPossible === 1 ? 'point' : 'points'}
                    </span>
                    <span className="bg-[hsl(var(--primary))] bg-opacity-10 text-[hsl(var(--primary))] text-xs font-semibold px-3 py-1 rounded-full">
                      {result.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                    {result.question}
                  </h3>
                </div>
                <div className="ml-4">
                  {result.isCorrect ? (
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                      <CheckCircle size={18} />
                      <span className="font-semibold">Correct</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full">
                      <XCircle size={18} />
                      <span className="font-semibold">Incorrect</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Display answers */}
              <div className="mt-4 space-y-3">
                <div className={`p-4 rounded-xl ${
                  result.isCorrect ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">Your Answer:</p>
                  <p className="text-[hsl(var(--foreground))] font-medium">
                    {result.yourAnswer || 'No answer provided'}
                  </p>
                </div>
                {!result.isCorrect && result.correctAnswer && (
                  <div className="bg-green-50 p-4 rounded-xl">
                    <p className="text-sm font-semibold text-green-900 mb-2">
                      Correct Answer:
                    </p>
                    <p className="text-green-900 font-medium">{result.correctAnswer}</p>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm pt-2">
                  <span className="text-[hsl(var(--muted-foreground))]">
                    Points Awarded: <span className="font-semibold text-[hsl(var(--foreground))]">{result.pointsAwarded}/{result.pointsPossible}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.status === 'pending-manual-grading' && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
            <AlertCircle className="text-yellow-600 mx-auto mb-3" size={48} />
            <p className="text-yellow-800 font-semibold mb-2">
              Manual Grading Pending
            </p>
            <p className="text-yellow-700 text-sm">
              Some questions (like essays) require manual grading. Your final score may change once all questions are graded.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPageComponent;
// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import {
//   CheckCircle,
//   XCircle,
//   Trophy,
//   Clock,
//   AlertCircle,
//   ArrowLeft,
//   Award,
//   Target,
// } from 'lucide-react';

// interface SubmissionAnswer {
//   question: string;
//   type: string;
//   yourAnswer: string;
//   correctAnswer: string;
//   isCorrect: boolean;
//   pointsAwarded: number;
//   pointsPossible: number;
// }

// interface SubmissionData {
//   id: string;
//   score: number;
//   totalPoints: number;
//   percentage: number;
//   timeTaken: number;
//   submittedAt: string;
//   status: string;
//   feedback: string;
//   answers: SubmissionAnswer[];
// }

// interface ResultsResponse {
//   success: boolean;
//   submission: SubmissionData;
// }

// const ResultsPageComponent = () => {
//   const params = useParams();
//   const router = useRouter();
//   const submissionId = params.id as string;

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [results, setResults] = useState<SubmissionData | null>(null);

//   useEffect(() => {
//     const fetchResults = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`/api/quiztaker/submission/${submissionId}`, {
//           method: 'GET',
//           credentials: 'include',
//         });

//         if (!response.ok) {
//           throw new Error('Failed to fetch results');
//         }

//         const data: ResultsResponse = await response.json();
//         setResults(data.submission);
//       } catch (err) {
//         console.error('Error fetching results:', err);
//         setError(err instanceof Error ? err.message : 'Failed to load results');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (submissionId) {
//       fetchResults();
//     }
//   }, [submissionId]);

//   const formatTime = (seconds: number): string => {
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = seconds % 60;
    
//     if (h > 0) {
//       return `${h}h ${m}m ${s}s`;
//     } else if (m > 0) {
//       return `${m}m ${s}s`;
//     }
//     return `${s}s`;
//   };

//   const getGradeColor = (percentage: number): string => {
//     if (percentage >= 90) return 'text-green-600';
//     if (percentage >= 80) return 'text-blue-600';
//     if (percentage >= 70) return 'text-yellow-600';
//     if (percentage >= 60) return 'text-orange-600';
//     return 'text-red-600';
//   };

//   const getGradeBgColor = (percentage: number): string => {
//     if (percentage >= 90) return 'bg-green-50 border-green-200';
//     if (percentage >= 80) return 'bg-blue-50 border-blue-200';
//     if (percentage >= 70) return 'bg-yellow-50 border-yellow-200';
//     if (percentage >= 60) return 'bg-orange-50 border-orange-200';
//     return 'bg-red-50 border-red-200';
//   };

//   const getGrade = (percentage: number): string => {
//     if (percentage >= 90) return 'A';
//     if (percentage >= 80) return 'B';
//     if (percentage >= 70) return 'C';
//     if (percentage >= 60) return 'D';
//     return 'F';
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading results...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !results) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <XCircle size={48} className="text-red-500 mx-auto mb-4" />
//           <p className="text-gray-600 mb-4">{error || 'Failed to load results'}</p>
//           <button
//             onClick={() => router.push('/dashboard')}
//             className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//           >
//             Back to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const correctAnswers = results.answers.filter(a => a.isCorrect).length;
//   const percentage = results.percentage;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <button
//             onClick={() => router.push('/dashboard')}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
//           >
//             <ArrowLeft size={20} />
//             Back to Dashboard
//           </button>
//           <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
//           <p className="text-sm text-gray-600">
//             {results.status === 'pending-manual-grading' 
//               ? 'Some questions require manual grading'
//               : 'Your quiz has been graded'}
//           </p>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Score Card */}
//         <div className={`bg-white rounded-xl shadow-lg border-2 p-8 mb-8 ${getGradeBgColor(percentage)}`}>
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center gap-4">
//               <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold ${getGradeColor(percentage)} bg-white shadow-lg`}>
//                 {getGrade(percentage)}
//               </div>
//               <div>
//                 <h2 className="text-3xl font-bold text-gray-900">{percentage}%</h2>
//                 <p className="text-gray-600">Your Score</p>
//               </div>
//             </div>
//             <Trophy className={`${getGradeColor(percentage)}`} size={64} />
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="bg-white rounded-lg p-4 shadow-sm">
//               <div className="flex items-center gap-2 mb-2">
//                 <Target className="text-indigo-600" size={20} />
//                 <p className="text-sm text-gray-600">Score</p>
//               </div>
//               <p className="text-2xl font-bold text-gray-900">
//                 {results.score}/{results.totalPoints}
//               </p>
//             </div>

//             <div className="bg-white rounded-lg p-4 shadow-sm">
//               <div className="flex items-center gap-2 mb-2">
//                 <CheckCircle className="text-green-600" size={20} />
//                 <p className="text-sm text-gray-600">Correct</p>
//               </div>
//               <p className="text-2xl font-bold text-green-600">
//                 {correctAnswers}/{results.answers.length}
//               </p>
//             </div>

//             <div className="bg-white rounded-lg p-4 shadow-sm">
//               <div className="flex items-center gap-2 mb-2">
//                 <Clock className="text-blue-600" size={20} />
//                 <p className="text-sm text-gray-600">Time Spent</p>
//               </div>
//               <p className="text-2xl font-bold text-blue-600">
//                 {formatTime(results.timeTaken)}
//               </p>
//             </div>

//             <div className="bg-white rounded-lg p-4 shadow-sm">
//               <div className="flex items-center gap-2 mb-2">
//                 <Award className="text-purple-600" size={20} />
//                 <p className="text-sm text-gray-600">Status</p>
//               </div>
//               <p className="text-sm font-bold text-purple-600 capitalize">
//                 {results.status.replace('-', ' ')}
//               </p>
//             </div>
//           </div>

//           {results.feedback && (
//             <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <p className="text-sm font-semibold text-blue-900 mb-2">Feedback:</p>
//               <p className="text-blue-800">{results.feedback}</p>
//             </div>
//           )}
//         </div>

//         {/* Question Results */}
//         <div className="space-y-4">
//           <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Results</h2>
//           {results.answers.map((result: SubmissionAnswer, index: number) => (
//             <div
//               key={index}
//               className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
//             >
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-2">
//                     <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded">
//                       Question {index + 1}
//                     </span>
//                     <span className="text-gray-600 text-sm">
//                       {result.pointsPossible} {result.pointsPossible === 1 ? 'point' : 'points'}
//                     </span>
//                     <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded">
//                       {result.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
//                     </span>
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     {result.question}
//                   </h3>
//                 </div>
//                 <div className="ml-4">
//                   {result.isCorrect ? (
//                     <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
//                       <CheckCircle size={18} />
//                       <span className="font-semibold">Correct</span>
//                     </div>
//                   ) : (
//                     <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full">
//                       <XCircle size={18} />
//                       <span className="font-semibold">Incorrect</span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Display answers */}
//               <div className="mt-4 space-y-3">
//                 <div className={`p-4 rounded-lg ${
//                   result.isCorrect ? 'bg-green-50' : 'bg-red-50'
//                 }`}>
//                   <p className="text-sm font-semibold text-gray-700 mb-1">Your Answer:</p>
//                   <p className="text-gray-900 font-medium">
//                     {result.yourAnswer || 'No answer provided'}
//                   </p>
//                 </div>
//                 {!result.isCorrect && result.correctAnswer && (
//                   <div className="bg-green-50 p-4 rounded-lg">
//                     <p className="text-sm font-semibold text-green-900 mb-1">
//                       Correct Answer:
//                     </p>
//                     <p className="text-green-900 font-medium">{result.correctAnswer}</p>
//                   </div>
//                 )}
//                 <div className="flex items-center justify-between text-sm">
//                   <span className="text-gray-600">
//                     Points Awarded: <span className="font-semibold">{result.pointsAwarded}/{result.pointsPossible}</span>
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {results.status === 'pending-manual-grading' && (
//           <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
//             <AlertCircle className="text-yellow-600 mx-auto mb-3" size={48} />
//             <p className="text-yellow-800 font-semibold mb-2">
//               Manual Grading Pending
//             </p>
//             <p className="text-yellow-700 text-sm">
//               Some questions (like essays) require manual grading. Your final score may change once all questions are graded.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ResultsPageComponent;