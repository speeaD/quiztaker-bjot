'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface QuizTimerProps {
  totalSeconds: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

const QuizTimer: React.FC<QuizTimerProps> = ({ totalSeconds, onTimeUp, isPaused = false }) => {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);

  useEffect(() => {
    setRemainingSeconds(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (isPaused || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, remainingSeconds, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    const percentage = (remainingSeconds / totalSeconds) * 100;
    if (percentage <= 10) return 'text-red-600 bg-red-50 border-red-300';
    if (percentage <= 25) return 'text-orange-600 bg-orange-50 border-orange-300';
    return 'text-[hsl(var(--foreground))] bg-[hsl(var(--card))] border-[hsl(var(--border))]';
  };

  const isLowTime = remainingSeconds <= totalSeconds * 0.1;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-mono text-lg font-semibold transition-colors ${getColorClass()}`}
    >
      {isLowTime ? (
        <AlertTriangle size={20} className="animate-pulse" />
      ) : (
        <Clock size={20} />
      )}
      <span>{formatTime(remainingSeconds)}</span>
    </div>
  );
};

export default QuizTimer;