import "dotenv/config";
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded
if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing required environment variables');
  console.error('Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function validateQuestion(question) {
  const requiredFields = ['subject', 'content', 'options', 'correct_answer', 'explanation'];
  const validSubjects = ['M1', 'M2', 'L', 'CB', 'CF', 'CQ', 'H'];
  const errors = [];

  // Verificar campos requeridos
  for (const field of requiredFields) {
    if (!question[field]) {
      errors.push(`Falta el campo requerido: ${field}`);
    }
  }

  // Validar subject
  if (!validSubjects.includes(question.subject)) {
    errors.push(`Subject inválido: ${question.subject}. Debe ser uno de: ${validSubjects.join(', ')}`);
  }

  // Validar options
  if (question.options) {
    const hasAllOptions = ['a', 'b', 'c', 'd'].every(key => question.options[key]);
    if (!hasAllOptions) {
      errors.push('Las opciones deben incluir a, b, c, y d');
    }
  }

  // Validar correct_answer
  if (!['a', 'b', 'c', 'd'].includes(question.correct_answer?.toLowerCase())) {
    errors.push('correct_answer debe ser a, b, c, o d');
  }

  // Validar área temática según el subject
  const areaValidations = {
    M1: ['Números', 'Álgebra y Funciones', 'Geometría', 'Probabilidad y Estadística'],
    M2: ['Números', 'Álgebra y Funciones', 'Geometría', 'Probabilidad y Estadística'],
    L: ['Localizar', 'Interpretar', 'Evaluar'],
    CB: ['Biología'],
    CF: ['Física'],
    CQ: ['Química'],
    H: ['Historia Universal', 'Historia de Chile', 'Geografía']
  };

  if (question.area_tematica && areaValidations[question.subject]) {
    if (!areaValidations[question.subject].includes(question.area_tematica)) {
      errors.push(`Área temática inválida para ${question.subject}: ${question.area_tematica}`);
    }
  }

  // Validar difficulty
  if (question.difficulty) {
    const difficulty = parseInt(question.difficulty);
    if (isNaN(difficulty) || difficulty < 1 || difficulty > 5) {
      errors.push('La dificultad debe ser un número entre 1 y 5');
    }
  }

  return errors;
}

async function importQuestions(filePath) {
  try {
    console.log(`Leyendo archivo: ${filePath}`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const questions = JSON.parse(fileContent);

    if (!Array.isArray(questions)) {
      throw new Error('El archivo debe contener un array de preguntas');
    }

    console.log(`Encontradas ${questions.length} preguntas`);
    
    // Validar todas las preguntas primero
    const validationErrors = [];
    for (let i = 0; i < questions.length; i++) {
      const errors = await validateQuestion(questions[i]);
      if (errors.length > 0) {
        validationErrors.push(`Pregunta ${i + 1}:\n${errors.join('\n')}`);
      }
    }

    if (validationErrors.length > 0) {
      console.error('Errores de validación encontrados:');
      validationErrors.forEach(error => console.error(error));
      throw new Error('Corrije los errores antes de continuar');
    }

    // Procesar las preguntas en lotes de 10
    const batchSize = 10;
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      
      // Preparar preguntas para inserción
      const preparedQuestions = batch.map(q => ({
        ...q,
        active: true,
        created_at: new Date().toISOString()
      }));

      console.log(`Insertando lote ${Math.floor(i / batchSize) + 1}...`);
      const { data, error } = await supabase
        .from('questions')
        .insert(preparedQuestions)
        .select();

      if (error) {
        throw error;
      }

      console.log(`Insertadas ${data.length} preguntas exitosamente`);
    }

    console.log('Importación completada exitosamente');
  } catch (error) {
    console.error('Error durante la importación:', error);
    process.exit(1);
  }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Uso: node importQuestions.js <ruta-al-archivo.json>');
  process.exit(1);
}

const filePath = args[0];
importQuestions(filePath);