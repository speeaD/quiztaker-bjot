// components/quiz/QuestionDisplay.tsx
'use client';

import React from 'react';
import { Question } from '../types/global';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  answer: string | boolean | undefined;
  onAnswerChange: (answer: string | boolean) => void;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  questionNumber,
  answer,
  onAnswerChange,
}) => {
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  answer === option
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question._id}`}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  className="mt-1 w-4 h-4 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                />
                <span className="flex-1 text-[hsl(var(--foreground))]">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="flex gap-4">
            <label
              className={`flex-1 flex items-center justify-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                answer === 'True'
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50'
              }`}
            >
              <input
                type="radio"
                name={`question-${question._id}`}
                value="True"
                checked={answer === 'True'}
                onChange={(e) => onAnswerChange(e.target.value)}
                className="w-4 h-4 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
              />
              <span className="font-semibold text-[hsl(var(--foreground))]">True</span>
            </label>
            <label
              className={`flex-1 flex items-center justify-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                answer === 'False'
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50'
              }`}
            >
              <input
                type="radio"
                name={`question-${question._id}`}
                value="False"
                checked={answer === 'False'}
                onChange={(e) => onAnswerChange(e.target.value)}
                className="w-4 h-4 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
              />
              <span className="font-semibold text-[hsl(var(--foreground))]">False</span>
            </label>
          </div>
        );

      case 'fill-in-the-blanks':
        return (
          <input
            type="text"
            value={(answer as string) || ''}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full p-4 border-2 border-[hsl(var(--border))] rounded-lg focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 text-[hsl(var(--foreground))] bg-[hsl(var(--background))]"
          />
        );

      case 'essay':
        return (
          <textarea
            value={(answer as string) || ''}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Write your answer here..."
            rows={8}
            className="w-full p-4 border-2 border-[hsl(var(--border))] rounded-lg focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 text-[hsl(var(--foreground))] bg-[hsl(var(--background))] resize-y"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg p-6 shadow-sm border border-[hsl(var(--border))]">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-10 h-10 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-full flex items-center justify-center font-bold">
          {questionNumber}
        </div>
        <div className="flex-1">
          <p className="text-lg text-[hsl(var(--foreground))] mb-2">{question.question}</p>
          <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="capitalize">{question.type.replace('-', ' ')}</span>
            <span>•</span>
            <span>{question.points} {question.points === 1 ? 'point' : 'points'}</span>
          </div>
        </div>
      </div>
      <div className="mt-4">{renderQuestionInput()}</div>
    </div>
  );
};

export default QuestionDisplay;