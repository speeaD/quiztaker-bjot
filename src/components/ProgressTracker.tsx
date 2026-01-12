'use client';

import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { QuestionSetProgress } from '@/types/global';

interface ProgressTrackerProps {
  questionSets: QuestionSetProgress[];
  currentQuestionSetOrder: number | undefined;
  onNavigate?: (order: number) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  questionSets,
  currentQuestionSetOrder,
  onNavigate,
}) => {
  const sortedSets = [...questionSets].sort((a, b) => {
    if (a.selectedOrder && b.selectedOrder) {
      return a.selectedOrder - b.selectedOrder;
    }
    return a.questionSetOrder - b.questionSetOrder;
  });

  const getStatusIcon = (status: string, order: number) => {
    if (status === 'completed') {
      return <CheckCircle className="text-green-600" size={24} />;
    }
    if (status === 'in-progress' || currentQuestionSetOrder === order) {
      return <Clock className="text-blue-600 animate-pulse" size={24} />;
    }
    return <Circle className="text-gray-400" size={24} />;
  };

  const getStatusColor = (status: string, order: number) => {
    if (status === 'completed') return 'bg-green-100 border-green-300';
    if (status === 'in-progress' || currentQuestionSetOrder === order) return 'bg-blue-100 border-blue-300';
    return 'bg-gray-100 border-gray-300';
  };

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg p-4 shadow-sm border border-[hsl(var(--border))]">
      <h3 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] mb-3">Progress</h3>
      <div className="flex gap-2 items-center justify-between">
        {sortedSets.map((set, index) => (
          <React.Fragment key={set.questionSetOrder}>
            <button
              onClick={() => onNavigate && set.status === 'completed' && onNavigate(set.questionSetOrder)}
              disabled={set.status !== 'completed'}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${getStatusColor(
                set.status,
                set.questionSetOrder
              )} ${
                set.status === 'completed' && onNavigate
                  ? 'cursor-pointer hover:shadow-md'
                  : 'cursor-default'
              }`}
            >
              {getStatusIcon(set.status, set.questionSetOrder)}
              <div className="text-center">
                <p className="text-xs font-semibold text-[hsl(var(--foreground))]">Set {set.selectedOrder || set.questionSetOrder}</p>
                {set.status === 'completed' && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {set.score}/{set.totalPoints}
                  </p>
                )}
              </div>
            </button>
            {index < sortedSets.length - 1 && (
              <div className="w-8 h-0.5 bg-gray-300" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;