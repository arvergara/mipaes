import { supabase } from './supabase';
import type { Question, Subject } from '../types';

export async function getQuestionsBySubject(subject: Subject): Promise<Question[]> {
  try {
    let query = supabase
      .from('questions')
      .select(`
        id,
        subject,
        content,
        options,
        correct_answer,
        explanation,
        area_tematica,
        tema,
        subtema,
        difficulty
      `)
      .eq('active', true);

    if (subject !== 'ALL') {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching questions:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn(`No questions found for subject: ${subject}`);
      return [];
    }

    // Transform and shuffle the questions
    return data
      .map((q): Question => ({
        id: q.id,
        subject: q.subject as Subject,
        content: q.content,
        options: q.options as Question['options'],
        correctAnswer: q.correct_answer as Question['correctAnswer'],
        explanation: q.explanation,
        areaTematica: q.area_tematica || undefined,
        tema: q.tema || undefined,
        subtema: q.subtema || undefined,
        difficulty: q.difficulty || undefined,
      }))
      .sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}