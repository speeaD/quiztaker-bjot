'use client';

import React, { useState } from 'react';
import { GripVertical, ArrowRight } from 'lucide-react';
import { QuestionSetOverview } from '@/types/global';

interface OrderSelectionProps {
  questionSets: QuestionSetOverview[];
  onOrderConfirmed: (order: number[]) => void;
  isLoading?: boolean;
}

const OrderSelection: React.FC<OrderSelectionProps> = ({
  questionSets,
  onOrderConfirmed,
  isLoading = false,
}) => {
  const [orderedSets, setOrderedSets] = useState<QuestionSetOverview[]>(
    [...questionSets].sort((a, b) => a.order - b.order)
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSets = [...orderedSets];
    const draggedItem = newSets[draggedIndex];
    newSets.splice(draggedIndex, 1);
    newSets.splice(index, 0, draggedItem);

    setOrderedSets(newSets);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSets = [...orderedSets];
    [newSets[index], newSets[index - 1]] = [newSets[index - 1], newSets[index]];
    setOrderedSets(newSets);
  };

  const moveDown = (index: number) => {
    if (index === orderedSets.length - 1) return;
    const newSets = [...orderedSets];
    [newSets[index], newSets[index + 1]] = [newSets[index + 1], newSets[index]];
    setOrderedSets(newSets);
  };

  const handleConfirm = () => {
    const order = orderedSets.map((set) => set.order);
    onOrderConfirmed(order);
  };

  return (
    <div className="max-w-3xl mx-auto bg-[hsl(var(--card))] rounded-xl p-8 shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
          Choose Your Question Set Order
        </h2>
        <p className="text-[hsl(var(--muted-foreground))]">
          Drag and drop to arrange the question sets in your preferred order
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {orderedSets.map((set, index) => (
          <div
            key={set._id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-4 p-4 bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] rounded-lg cursor-move hover:shadow-md transition-all ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="p-1 hover:bg-[hsl(var(--accent))] rounded disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="text-xs">▲</span>
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === orderedSets.length - 1}
                className="p-1 hover:bg-[hsl(var(--accent))] rounded disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="text-xs">▼</span>
              </button>
            </div>

            <GripVertical className="text-[hsl(var(--muted-foreground))]" size={24} />

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-bold">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  {set.title}
                </h3>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] ml-10">
                {set.questionCount} questions • {set.totalPoints} points
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className="w-full py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <span>Confirm Order & Start Quiz</span>
            <ArrowRight size={20} />
          </>
        )}
      </button>
    </div>
  );
};

export default OrderSelection;