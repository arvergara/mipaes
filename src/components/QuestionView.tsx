import React, { useState } from 'react';
import clsx from 'clsx';
import { Flag } from 'lucide-react';
import type { Question } from '../types';
import { FeedbackModal } from './FeedbackModal';

interface QuestionViewProps {
  question: Question;
  currentAnswer: string | null;
  onAnswer: (answer: string) => void;
  showExplanation?: boolean;
}

export function QuestionView({ 
  question, 
  currentAnswer, 
  onAnswer,
  showExplanation = false,
}: QuestionViewProps) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const options = Object.entries(question.options);

  return (
    <div className="flex flex-col min-h-[calc(100vh-16rem)]">
      <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 mb-4">
        <div className="flex justify-between items-start mb-6">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-800">{question.content}</p>
          </div>
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="ml-4 text-gray-500 hover:text-red-600 transition-colors"
            title="Reportar pregunta"
          >
            <Flag className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          {options.map(([key, value]) => {
            const isSelected = currentAnswer === key;
            const isCorrect = showExplanation && key === question.correctAnswer;
            const isWrong = showExplanation && isSelected && key !== question.correctAnswer;

            return (
              <button
                key={key}
                onClick={() => onAnswer(key)}
                disabled={showExplanation}
                className={clsx(
                  'w-full text-left p-4 rounded-lg border-2 transition-all',
                  'hover:border-indigo-500 hover:bg-indigo-50',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                  {
                    'border-gray-200 bg-white': !isSelected && !isCorrect && !isWrong,
                    'border-indigo-500 bg-indigo-50': isSelected && !showExplanation,
                    'border-green-500 bg-green-50': isCorrect,
                    'border-red-500 bg-red-50': isWrong,
                  }
                )}
              >
                <div className="flex items-start">
                  <span className="font-semibold text-lg mr-3">{key.toUpperCase()})</span>
                  <span className="text-lg">{value}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showExplanation && (
        <div className="w-full max-w-3xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-900 mb-2">Explicación:</h4>
          <p className="text-blue-800">{question.explanation}</p>
        </div>
      )}

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        questionId={question.id}
      />
    </div>
  );
}