import type { Question, Subject } from '../types';

// Import consolidated questions as fallback data
let consolidatedQuestions: any[] = [];

// Load consolidated questions
async function loadConsolidatedQuestions() {
  if (consolidatedQuestions.length > 0) return consolidatedQuestions;
  
  try {
    const response = await fetch('/consolidated_questions.json');
    if (response.ok) {
      consolidatedQuestions = await response.json();
    }
  } catch (error) {
    console.warn('Could not load consolidated questions:', error);
  }
  
  return consolidatedQuestions;
}

// Transform consolidated question to app format
function transformQuestion(q: any): Question {
  return {
    id: q.id || `q_${Math.random().toString(36).substr(2, 9)}`,
    subject: q.subject,
    content: q.content,
    options: {
      a: q.options?.a || q.options?.A || '',
      b: q.options?.b || q.options?.B || '',
      c: q.options?.c || q.options?.C || '',
      d: q.options?.d || q.options?.D || '',
    },
    correctAnswer: (q.correct_answer || 'a').toLowerCase() as 'a' | 'b' | 'c' | 'd',
    explanation: q.explanation || 'Explicación no disponible',
    areaTematica: q.area_tematica,
    tema: q.tema,
    difficulty: q.difficulty || 3,
    habilidad: q.habilidad,
    readingContext: q.reading_context ? {
      titulo: q.reading_context.titulo,
      texto: q.reading_context.texto,
      numero_lectura: q.reading_context.numero_lectura
    } : undefined,
    hasImages: q.has_images || false,
    imageRefs: q.image_refs || [],
    numeroOriginal: q.numero_pregunta
  };
}

export async function getQuestionsBySubjectLocal(subject: Subject): Promise<Question[]> {
  const questions = await loadConsolidatedQuestions();
  
  let filtered = questions;
  
  // Filter by subject
  if (subject !== 'ALL') {
    filtered = questions.filter(q => q.subject === subject);
  }
  
  // Filter valid questions
  filtered = filtered.filter(q => 
    q.content && 
    q.options && 
    Object.keys(q.options).length >= 2
  );
  
  // Transform and shuffle
  const transformed = filtered.map(transformQuestion);
  
  // Shuffle array
  for (let i = transformed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [transformed[i], transformed[j]] = [transformed[j], transformed[i]];
  }
  
  return transformed;
}

export async function getQuestionsByAreaLocal(subject: Subject, area: string): Promise<Question[]> {
  const questions = await getQuestionsBySubjectLocal(subject);
  return questions.filter(q => q.areaTematica === area);
}

export async function getRandomQuestionsLocal(count: number = 20, subjects?: Subject[]): Promise<Question[]> {
  const allQuestions = await loadConsolidatedQuestions();
  
  let filtered = allQuestions;
  
  if (subjects && subjects.length > 0 && !subjects.includes('ALL')) {
    filtered = allQuestions.filter(q => subjects.includes(q.subject));
  }
  
  // Filter valid questions
  filtered = filtered.filter(q => 
    q.content && 
    q.options && 
    Object.keys(q.options).length >= 2
  );
  
  // Shuffle and take count
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  return selected.map(transformQuestion);
}

export async function getQuestionStatsLocal(): Promise<{
  total: number;
  bySubject: Record<string, number>;
  byArea: Record<string, number>;
}> {
  const questions = await loadConsolidatedQuestions();
  
  const stats = {
    total: questions.length,
    bySubject: {} as Record<string, number>,
    byArea: {} as Record<string, number>
  };
  
  questions.forEach(q => {
    // Count by subject
    stats.bySubject[q.subject] = (stats.bySubject[q.subject] || 0) + 1;
    
    // Count by area
    if (q.area_tematica) {
      stats.byArea[q.area_tematica] = (stats.byArea[q.area_tematica] || 0) + 1;
    }
  });
  
  return stats;
}