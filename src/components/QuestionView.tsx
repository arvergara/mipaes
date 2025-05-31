import React, { useState } from 'react';
import clsx from 'clsx';
import { Flag, BookOpen, Image as ImageIcon } from 'lucide-react';
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
  const [showFullReading, setShowFullReading] = useState(false);
  
  // Normalize options to handle both lowercase and uppercase
  const normalizedOptions = Object.entries(question.options)
    .filter(([_, value]) => value && value.trim() !== '')
    .map(([key, value]) => [key.toLowerCase(), value] as [string, string]);

  const getSubjectColor = (subject: string) => {
    const colors = {
      'M1': 'bg-blue-50 border-blue-200 text-blue-800',
      'M2': 'bg-indigo-50 border-indigo-200 text-indigo-800', 
      'L': 'bg-green-50 border-green-200 text-green-800',
      'CB': 'bg-orange-50 border-orange-200 text-orange-800',
      'CF': 'bg-red-50 border-red-200 text-red-800',
      'CQ': 'bg-purple-50 border-purple-200 text-purple-800',
      'H': 'bg-yellow-50 border-yellow-200 text-yellow-800',
    };
    return colors[subject as keyof typeof colors] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-16rem)]">
      {/* Question metadata */}
      <div className="w-full max-w-3xl mx-auto mb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSubjectColor(question.subject)}`}>
            {question.subject}
          </span>
          {question.areaTematica && (
            <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
              {question.areaTematica}
            </span>
          )}
          {question.habilidad && (
            <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
              {question.habilidad}
            </span>
          )}
        </div>
      </div>

      {/* Reading context for Language questions */}
      {question.readingContext && (
        <div className="w-full max-w-3xl mx-auto bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-green-800">
                Lectura {question.readingContext.numero_lectura}: {question.readingContext.titulo}
              </h3>
            </div>
            <button
              onClick={() => setShowFullReading(!showFullReading)}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              {showFullReading ? 'Ocultar' : 'Ver completa'}
            </button>
          </div>
          
          <div className={clsx(
            'text-green-700 leading-relaxed',
            !showFullReading && 'max-h-32 overflow-hidden relative'
          )}>
            <p className="whitespace-pre-line">{question.readingContext.texto}</p>
            {!showFullReading && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-green-50 to-transparent" />
            )}
          </div>
        </div>
      )}

      {/* Main question */}
      <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 mb-4">
        <div className="flex justify-between items-start mb-6">
          <div className="prose max-w-none flex-1">
            {question.hasImages && (
              <div className="flex items-center mb-3 text-orange-600">
                <ImageIcon className="h-4 w-4 mr-2" />
                <span className="text-sm">Esta pregunta incluye elementos visuales</span>
              </div>
            )}
            <p className="text-lg text-gray-800 whitespace-pre-line">{question.content}</p>
          </div>
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="ml-4 text-gray-500 hover:text-red-600 transition-colors flex-shrink-0"
            title="Reportar pregunta"
          >
            <Flag className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          {normalizedOptions.map(([key, value]) => {
            const isSelected = currentAnswer === key;
            const correctAnswer = question.correctAnswer.toLowerCase();
            const isCorrect = showExplanation && key === correctAnswer;
            const isWrong = showExplanation && isSelected && key !== correctAnswer;

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
                  <span className="text-lg whitespace-pre-line">{value}</span>
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