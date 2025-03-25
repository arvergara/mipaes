import React, { useState, useEffect } from 'react';
import { Timer } from './Timer';
import { QuestionView } from './QuestionView';
import { Home } from 'lucide-react';
import type { Question, Subject } from '../types';
import { getQuestionsBySubject } from '../lib/questions';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface PAESModeProps {
  subject: Subject;
  onExit: () => void;
}

export function PAESMode({ subject, onExit }: PAESModeProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState<string>(() => crypto.randomUUID());

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        if (subject === 'ALL') {
          // Get 3 random questions from each subject for a total of 12 questions
          const [m1Questions, m2Questions, lQuestions, cQuestions] = await Promise.all([
            getQuestionsBySubject('M1'),
            getQuestionsBySubject('M2'),
            getQuestionsBySubject('L'),
            getQuestionsBySubject('C')
          ]);

          // Check if we have enough questions from each subject
          if (!m1Questions.length || !m2Questions.length || !lQuestions.length || !cQuestions.length) {
            throw new Error('No hay suficientes preguntas disponibles para todas las materias');
          }

          const selectedQuestions = [
            ...m1Questions.slice(0, 3),
            ...m2Questions.slice(0, 3),
            ...lQuestions.slice(0, 3),
            ...cQuestions.slice(0, 3)
          ].sort(() => Math.random() - 0.5);

          setQuestions(selectedQuestions);
        } else {
          const subjectQuestions = await getQuestionsBySubject(subject);
          
          if (!subjectQuestions.length) {
            throw new Error(`No hay preguntas disponibles para ${subject}`);
          }

          // Get 12 random questions for PAES mode
          const selectedQuestions = subjectQuestions
            .sort(() => Math.random() - 0.5)
            .slice(0, 12);

          setQuestions(selectedQuestions);
        }
      } catch (error) {
        console.error('Error loading questions:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar las preguntas');
        toast.error('Error al cargar las preguntas');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [subject]);

  const saveSession = async () => {
    if (!user) return;

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const correctAnswers = Object.entries(answers).reduce((count, [_, answer]) => {
      const question = questions[parseInt(_)];
      return count + (answer === question.correctAnswer ? 1 : 0);
    }, 0);

    try {
      // First save the session
      const { error: sessionError } = await supabase.from('user_sessions').insert({
        id: sessionId,
        user_id: user.id,
        subject,
        mode: 'PAES',
        questions_total: questions.length,
        questions_correct: correctAnswers,
        time_spent: timeSpent
      });

      if (sessionError) throw sessionError;

      // Then save each question attempt
      const attempts = Object.entries(answers).map(([index, answer]) => {
        const question = questions[parseInt(index)];
        const isCorrect = answer === question.correctAnswer;

        return {
          user_id: user.id,
          session_id: sessionId,
          question_id: question.id,
          subject: question.subject,
          mode: 'PAES',
          area_tematica: question.areaTematica,
          tema: question.tema,
          subtema: question.subtema,
          answer,
          is_correct: isCorrect,
          time_spent: Math.round(timeSpent / questions.length) // Distribute time evenly for now
        };
      });

      const { error: attemptsError } = await supabase
        .from('question_attempts')
        .insert(attempts);

      if (attemptsError) throw attemptsError;
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Error al guardar la sesión');
    }
  };

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    await saveSession();
    setIsFinished(true);
  };

  const handleTimeUp = async () => {
    await saveSession();
    setIsFinished(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Cargando preguntas...</div>
      </div>
    );
  }

  if (error || !questions.length) {
    return (
      <div className="text-center">
        <p className="text-red-600 mb-4">{error || 'No hay preguntas disponibles en este momento.'}</p>
        <button
          onClick={onExit}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  if (isFinished) {
    const correctAnswers = Object.entries(answers).reduce((count, [_, answer]) => {
      const question = questions[parseInt(_)];
      return count + (answer === question.correctAnswer ? 1 : 0);
    }, 0);

    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">¡Tiempo Finalizado!</h2>
        <p className="mb-4">Has respondido {Object.keys(answers).length} de {questions.length} preguntas.</p>
        <p className="mb-4">Respuestas correctas: {correctAnswers}</p>
        <button
          onClick={onExit}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onExit}
            className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Inicio</span>
          </button>
          <Timer totalMinutes={Math.round(questions.length * 2.16)} onTimeUp={handleTimeUp} />
        </div>
        <div className="text-gray-600">
          Pregunta {currentQuestionIndex + 1} de {questions.length}
        </div>
      </div>

      <div className="mb-4 text-sm font-medium text-gray-600">
        Materia: {
          questions[currentQuestionIndex].subject === 'M1' ? 'Matemática 1' :
          questions[currentQuestionIndex].subject === 'M2' ? 'Matemática 2' :
          questions[currentQuestionIndex].subject === 'L' ? 'Lenguaje' :
          'Ciencias'
        }
      </div>

      <QuestionView
        question={questions[currentQuestionIndex]}
        currentAnswer={answers[currentQuestionIndex] || null}
        onAnswer={handleAnswer}
      />

      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleFinish}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Finalizar
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
}