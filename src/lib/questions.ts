import { supabase } from './supabase';
import { getQuestionsBySubjectLocal, getQuestionsByAreaLocal, getRandomQuestionsLocal } from './questionsLocal';
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
        difficulty,
        habilidad,
        reading_context,
        has_images,
        image_refs,
        numero_pregunta
      `)
      .eq('active', true);

    if (subject !== 'ALL') {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching questions from Supabase:', error);
      console.log('Falling back to local questions...');
      return await getQuestionsBySubjectLocal(subject);
    }

    if (!data || data.length === 0) {
      console.warn(`No questions found in Supabase for subject: ${subject}, trying local...`);
      return await getQuestionsBySubjectLocal(subject);
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
        habilidad: q.habilidad || undefined,
        readingContext: q.reading_context ? {
          titulo: q.reading_context.titulo,
          texto: q.reading_context.texto,
          numero_lectura: q.reading_context.numero_lectura
        } : undefined,
        hasImages: q.has_images || false,
        imageRefs: q.image_refs || [],
        numeroOriginal: q.numero_pregunta
      }))
      .sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error('Error fetching questions from Supabase:', error);
    console.log('Falling back to local questions...');
    return await getQuestionsBySubjectLocal(subject);
  }
}

export async function getQuestionsByArea(subject: Subject, area: string): Promise<Question[]> {
  try {
    const { data, error } = await supabase
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
        difficulty,
        habilidad,
        reading_context,
        has_images,
        image_refs,
        numero_pregunta
      `)
      .eq('active', true)
      .eq('subject', subject)
      .eq('area_tematica', area);

    if (error) {
      console.error('Error fetching questions by area from Supabase:', error);
      return await getQuestionsByAreaLocal(subject, area);
    }

    if (!data || data.length === 0) {
      console.warn(`No questions found for ${subject} - ${area}, trying local...`);
      return await getQuestionsByAreaLocal(subject, area);
    }

    return data.map((q): Question => ({
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
      habilidad: q.habilidad || undefined,
      readingContext: q.reading_context ? {
        titulo: q.reading_context.titulo,
        texto: q.reading_context.texto,
        numero_lectura: q.reading_context.numero_lectura
      } : undefined,
      hasImages: q.has_images || false,
      imageRefs: q.image_refs || [],
      numeroOriginal: q.numero_pregunta
    })).sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error('Error fetching questions by area:', error);
    return await getQuestionsByAreaLocal(subject, area);
  }
}

export async function getRandomQuestions(count: number = 20, subjects?: Subject[]): Promise<Question[]> {
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
        difficulty,
        habilidad,
        reading_context,
        has_images,
        image_refs,
        numero_pregunta
      `)
      .eq('active', true);

    if (subjects && subjects.length > 0 && !subjects.includes('ALL')) {
      query = query.in('subject', subjects);
    }

    const { data, error } = await query.limit(count * 2); // Get more to ensure we have enough after shuffling

    if (error) {
      console.error('Error fetching random questions from Supabase:', error);
      return await getRandomQuestionsLocal(count, subjects);
    }

    if (!data || data.length === 0) {
      console.warn('No random questions found in Supabase, trying local...');
      return await getRandomQuestionsLocal(count, subjects);
    }

    const questions = data.map((q): Question => ({
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
      habilidad: q.habilidad || undefined,
      readingContext: q.reading_context ? {
        titulo: q.reading_context.titulo,
        texto: q.reading_context.texto,
        numero_lectura: q.reading_context.numero_lectura
      } : undefined,
      hasImages: q.has_images || false,
      imageRefs: q.image_refs || [],
      numeroOriginal: q.numero_pregunta
    }));

    // Shuffle and return requested count
    return questions.sort(() => Math.random() - 0.5).slice(0, count);
  } catch (error) {
    console.error('Error fetching random questions:', error);
    return await getRandomQuestionsLocal(count, subjects);
  }
}