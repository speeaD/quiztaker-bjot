/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getQuestion, submitAnswer, quitGame } from '@/app/actions/scholarswager';

interface GamePlayProps {
  sessionId: string;
}

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  pointsChange: number;
  newScore: number;
  status: string;
}

type GameState = 'wager' | 'question' | 'result' | 'loading';

export default function GamePlay({ sessionId }: GamePlayProps) {
  const router = useRouter();
  const userId = localStorage.getItem('quizTaker') as string;
  const [gameState, setGameState] = useState<GameState>('loading');
  const [currentScore, setCurrentScore] = useState(100);
  const [goalScore] = useState(1000);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedWager, setSelectedWager] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [questionsRemaining, setQuestionsRemaining] = useState(0);
  const [error, setError] = useState('');
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadNextQuestion();
  }, []);

  const loadNextQuestion = async () => {
    try {
      setGameState('loading');
      setError('');
      
      const response = await getQuestion(sessionId, userId);

      if (!response.success) {
        setError(response.error || 'Failed to load question');
        setGameState('wager');
        return;
      }

      if (response.data.gameOver) {
        router.push(`/scholars-wager/result/${sessionId}`);
        return;
      }

      setQuestion(response.data.question);
      setCurrentScore(response.data.currentScore);
      setQuestionsAnswered(response.data.questionsAnswered);
      setQuestionsRemaining(response.data.questionsRemaining);
      setGameState('wager');
    } catch (err: any) {
      setError('An unexpected error occurred: ' + err.message);
      setGameState('wager');
    }
  };

  const handleWagerSelect = (wager: number) => {
    setSelectedWager(wager);
    setGameState('question');
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !selectedWager || !question) return;

    try {
      setGameState('loading');
      setError('');
      
      const response = await submitAnswer(
        sessionId,
        question.id,
        selectedAnswer,
        selectedWager,
        userId
      );

      if (!response.success) {
        setError(response.error || 'Failed to submit answer');
        setGameState('question');
        return;
      }

      setAnswerResult(response.data.result);
      setCurrentScore(response.data.result.newScore);
      setGameState('result');

      // Check if game is over
      if (response.data.gameOver) {
        setTimeout(() => {
          router.push(`/scholars-wager/result/${sessionId}`);
        }, 2000);
      }
    } catch (err: any) {

      setError('An unexpected error occurred: ' + err.message);
      setGameState('question');
    }
  };

  const handleNextQuestion = () => {
    setSelectedWager(null);
    setSelectedAnswer(null);
    setAnswerResult(null);
    loadNextQuestion();
  };

  const handleQuitGame = async () => {
    try {
      await quitGame(sessionId);
      router.push('/game-hub');
    } catch (err: any) {
    console.log('Failed to quit game:', err);
      router.push('/game-hub');
    }
  };

  const getAnswerLabel = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            QUIT GAME
          </button>
          
          <h1 className="text-xl font-bold text-gray-900">Scholar&apos;s Wager</h1>
        </div>

        {/* Score Display */}
        <div className="bg-gray-900 text-white rounded-lg p-6 mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            <span className="text-3xl font-bold">{currentScore}</span>
          </div>
          <div className="text-right text-sm text-gray-400">
            GOAL: {goalScore}
          </div>
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

        {/* Wager Selection */}
        {gameState === 'wager' && (
          <div>
            <div className="text-center mb-8">
              <p className="text-xl text-purple-600 font-semibold mb-2">
                PLAYING FOR {selectedWager || '?'} POINTS
              </p>
              <h2 className="text-lg text-gray-700">How confident are you?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => handleWagerSelect(5)}
                disabled={currentScore < 5}
                className="bg-white border-2 border-gray-300 rounded-lg p-8 hover:border-yellow-500 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-center">
                  <p className="text-sm text-gray-500 uppercase mb-2">Unsure</p>
                  <p className="text-4xl font-bold text-gray-900 mb-2">5 PTS</p>
                  <p className="text-sm text-gray-600">50% Return</p>
                </div>
              </button>

              <button
                onClick={() => handleWagerSelect(10)}
                disabled={currentScore < 10}
                className="bg-white border-2 border-gray-300 rounded-lg p-8 hover:border-green-500 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-center">
                  <p className="text-sm text-gray-500 uppercase mb-2">Confident</p>
                  <p className="text-4xl font-bold text-gray-900 mb-2">10 PTS</p>
                  <p className="text-sm text-gray-600">100% Return</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Question Display */}
        {gameState === 'question' && question && (
          <div>
            <div className="bg-purple-600 text-white rounded-lg px-6 py-3 mb-6 text-center">
              <p className="text-sm uppercase tracking-wide">Playing for {selectedWager} points</p>
            </div>

            <div className="bg-white rounded-lg p-6 mb-6">
              <p className="text-lg text-gray-900 mb-6">{question.text}</p>

              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedAnswer === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="font-semibold text-blue-600 mr-3">
                      {getAnswerLabel(index)}.
                    </span>
                    <span className="text-gray-900">{option}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          </div>
        )}

        {/* Answer Result */}
        {gameState === 'result' && answerResult && (
          <div>
            <div className={`rounded-lg p-8 mb-6 text-center ${
              answerResult.isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
            }`}>
              <div className="mb-4">
                {answerResult.isCorrect ? (
                  <svg className="w-16 h-16 mx-auto text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-16 h-16 mx-auto text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              <h2 className={`text-3xl font-bold mb-2 ${answerResult.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {answerResult.isCorrect ? 'Correct!' : 'Incorrect!'}
              </h2>
              
              <p className={`text-xl font-semibold ${answerResult.pointsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {answerResult.pointsChange > 0 ? '+' : ''}{answerResult.pointsChange} points
              </p>

              {!answerResult.isCorrect && (
                <div className="mt-4 p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Correct answer:</p>
                  <p className="text-lg font-semibold text-gray-900">{answerResult.correctAnswer}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleNextQuestion}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Next Question
            </button>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Questions answered: {questionsAnswered} | Remaining: {questionsRemaining}
        </div>

        {/* Quit Confirmation Modal */}
        {showQuitConfirm && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quit Game?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to quit? Your progress will be saved but marked as abandoned.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowQuitConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuitGame}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Quit Game
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}