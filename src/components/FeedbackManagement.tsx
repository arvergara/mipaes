import React, { useState, useEffect } from 'react';
import { X, Check, XCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface Feedback {
  id: string;
  user_id: string;
  question_id: string;
  feedback_type: 'error' | 'improvement' | 'other';
  content: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  question?: {
    content: string;
    correct_answer: string;
    explanation: string;
  };
  user?: {
    email: string;
  };
}

interface FeedbackManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackManagement({ isOpen, onClose }: FeedbackManagementProps) {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('question_feedback')
          .select(`
            *,
            question:questions(content, correct_answer, explanation),
            user:users(email)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFeedback(data || []);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        toast.error('Error al cargar el feedback');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [isOpen, user]);

  const handleUpdateStatus = async (feedbackId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('question_feedback')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', feedbackId);

      if (error) throw error;

      setFeedback(prev =>
        prev.map(f =>
          f.id === feedbackId
            ? {
                ...f,
                status: newStatus,
                reviewed_at: new Date().toISOString(),
                reviewed_by: user?.id || null
              }
            : f
        )
      );

      toast.success(`Feedback ${newStatus === 'approved' ? 'aprobado' : 'rechazado'}`);
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Error al actualizar el feedback');
    }
  };

  if (!isOpen) return null;

  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'improvement':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">Pendiente</span>;
      case 'approved':
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">Aprobado</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">Rechazado</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">Revisado</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl relative my-8">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Cargando feedback...</p>
          </div>
        ) : feedback.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">No hay feedback pendiente de revisión</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Lista de Feedback</h3>
                {feedback.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedFeedback?.id === item.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                    onClick={() => setSelectedFeedback(item)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getFeedbackTypeIcon(item.feedback_type)}
                        <span className="font-medium text-gray-900">
                          {item.feedback_type === 'error' ? 'Error' :
                           item.feedback_type === 'improvement' ? 'Mejora' : 'Otro'}
                        </span>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>

              {selectedFeedback && (
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles del Feedback</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700">Pregunta Original</h4>
                      <p className="mt-1 text-gray-600">{selectedFeedback.question?.content}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700">Feedback</h4>
                      <p className="mt-1 text-gray-600">{selectedFeedback.content}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700">Información Adicional</h4>
                      <dl className="mt-1 space-y-1 text-sm">
                        <div className="flex">
                          <dt className="w-24 text-gray-500">Usuario:</dt>
                          <dd className="text-gray-900">{selectedFeedback.user?.email}</dd>
                        </div>
                        <div className="flex">
                          <dt className="w-24 text-gray-500">Fecha:</dt>
                          <dd className="text-gray-900">
                            {new Date(selectedFeedback.created_at).toLocaleString()}
                          </dd>
                        </div>
                        <div className="flex">
                          <dt className="w-24 text-gray-500">Estado:</dt>
                          <dd className="text-gray-900">
                            {getStatusBadge(selectedFeedback.status)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {selectedFeedback.status === 'pending' && (
                      <div className="flex space-x-4 mt-6">
                        <button
                          onClick={() => handleUpdateStatus(selectedFeedback.id, 'approved')}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Check className="h-5 w-5 inline-block mr-2" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedFeedback.id, 'rejected')}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="h-5 w-5 inline-block mr-2" />
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}