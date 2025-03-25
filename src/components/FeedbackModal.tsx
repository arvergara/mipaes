import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
}

export function FeedbackModal({ isOpen, onClose, questionId }: FeedbackModalProps) {
  const { user } = useAuth();
  const [feedbackType, setFeedbackType] = useState<'error' | 'improvement' | 'other'>('error');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debes iniciar sesión para enviar feedback');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('question_feedback').insert({
        user_id: user.id,
        question_id: questionId,
        feedback_type: feedbackType,
        content
      });

      if (error) throw error;

      toast.success('¡Gracias por tu feedback!');
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Error al enviar el feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Reportar Pregunta
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Feedback
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value as typeof feedbackType)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="error">Error en la pregunta</option>
                <option value="improvement">Sugerencia de mejora</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
                required
                placeholder="Describe el problema o sugerencia..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar Feedback'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}