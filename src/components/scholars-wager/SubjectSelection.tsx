/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSubjects, startGame } from '@/app/actions/scholarswager';

interface Subject {
  id: string;
  name: string;
  questionCount: number;
}

export default function SubjectSelection() {
  const router = useRouter();
  const userId = typeof window !== 'undefined' && localStorage.getItem('quizTaker') 
    ? localStorage.getItem('quizTaker') as string 
    : 'Guest';
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await getSubjects();
      
      if (response.success && response.data) {
        console.log('Fetched Subjects:', response.data);
        setSubjects(response.data);
      } else {
        setError(response.error || 'Failed to load subjects');
      }
    } catch (err: any) {
      setError('An unexpected error occurred:' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async (subjectId: string) => {
    try {
      setStarting(true);
      setSelectedSubject(subjectId);
      setError('');
      
      const response = await startGame(subjectId, userId);
      console.log('Start Game Response:', response);
      
      
      if (response.success && response.data) {
        router.push(`/scholars-wager/play/${response.data.id}`);
      } else {
        // If user has active session, redirect to it
        if (response.data) {
          router.push(`/scholars-wager/play/${response.data}`);
        } else {
          setError(response.error || 'Failed to start game');
          setStarting(false);
          setSelectedSubject(null);
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred:' + err.message);
      setStarting(false);
      setSelectedSubject(null);
    }
  };

  const handleQuitGame = () => {
    router.push('/game-hub');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleQuitGame}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            QUIT GAME
          </button>
          
          <h1 className="text-xl font-bold text-gray-900">Scholar&apos;s Wager</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Subject Selection */}
        <div>
          <h2 className="text-md font-semibold text-gray-900 mb-6">Select Subject to Start</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => handleStartGame(subject.id)}
                disabled={starting}
                className={`
                  bg-white border-2 border-gray-200 rounded-lg p-4 text-left
                  hover:border-blue-500 hover:shadow-md transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${selectedSubject === subject.id ? 'border-blue-500 shadow-md' : ''}
                `}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-md font-semibold text-gray-900">{subject.name}</h3>
                  {starting && selectedSubject === subject.id && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {subject.questionCount} questions available
                </p>
              </button>
            ))}
          </div>

          {subjects.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600">No subjects available at the moment</p>
              <button
                onClick={fetchSubjects}
                className="mt-4 text-blue-600 hover:text-blue-800 font-semibold"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Game Instructions */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-md font-semibold text-blue-900 mb-3">How to Play</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Start with 100 points. Goal: reach 1000 points!</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Before each question, choose your confidence level:</span>
            </li>
            <li className="ml-6 flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Unsure (5 pts)</strong> - Win 2.5 points if correct, lose 5 if wrong</span>
            </li>
            <li className="ml-6 flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Confident (10 pts)</strong> - Win 10 points if correct, lose 10 if wrong</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Answer all questions or reach 1000 points to win!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}