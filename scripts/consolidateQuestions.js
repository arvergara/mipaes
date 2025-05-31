import "dotenv/config";
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
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

// Subject mapping and configuration
const SUBJECT_CONFIG = {
  'L': {
    code: 'L',
    name: 'Lenguaje',
    hasReadings: true,
    hasImages: false,
    structure: 'grouped' // Multiple questions per reading
  },
  'M1': {
    code: 'M1', 
    name: 'Matemática 1',
    hasReadings: false,
    hasImages: true,
    structure: 'individual'
  },
  'M2': {
    code: 'M2',
    name: 'Matemática 2', 
    hasReadings: false,
    hasImages: true,
    structure: 'individual'
  },
  'H': {
    code: 'H',
    name: 'Historia',
    hasReadings: true,
    hasImages: false,
    structure: 'individual'
  },
  'CB': {
    code: 'CB',
    name: 'Ciencias - Biología',
    hasReadings: false,
    hasImages: true,
    structure: 'individual'
  },
  'CF': {
    code: 'CF', 
    name: 'Ciencias - Física',
    hasReadings: false,
    hasImages: true,
    structure: 'individual'
  },
  'CQ': {
    code: 'CQ',
    name: 'Ciencias - Química',
    hasReadings: false,
    hasImages: true,
    structure: 'individual'
  }
};

// Load temario mapping
async function loadTemario() {
  const temarioPath = '/Users/alfil/Mi unidad/5_PAES/VibeCoding/temario_paes_vs.csv';
  const content = await fs.readFile(temarioPath, 'utf-8');
  const lines = content.split('\n').slice(1); // Skip header
  
  const temario = {};
  
  for (const line of lines) {
    if (!line.trim()) continue;
    const [subject, area, tema, habilidad] = line.split(';');
    
    if (!temario[subject]) {
      temario[subject] = {};
    }
    if (!temario[subject][area]) {
      temario[subject][area] = [];
    }
    
    temario[subject][area].push({
      tema: tema.trim(),
      habilidades: habilidad.replace(/"/g, '').split(',').map(h => h.trim())
    });
  }
  
  return temario;
}

// Process Language questions (with readings)
async function processLanguageQuestions(filePath) {
  console.log(`Processing Language file: ${filePath}`);
  
  const content = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  const questions = [];
  
  // Process each reading with its questions
  for (const lectura of data) {
    const readingContext = {
      titulo: lectura.titulo,
      texto: lectura.texto,
      numero_lectura: lectura.numero
    };
    
    for (const pregunta of lectura.preguntas) {
      questions.push({
        id: `L_${lectura.numero}_${pregunta.numero}`,
        subject: 'L',
        content: pregunta.pregunta,
        options: pregunta.alternativas,
        correct_answer: pregunta.respuesta_correcta,
        explanation: pregunta.explicacion || '',
        reading_context: readingContext,
        numero_pregunta: pregunta.numero,
        area_tematica: 'Comprensión Lectora', // Will be mapped later
        tema: 'Lectura y análisis textual',
        difficulty: 3,
        active: true,
        source_file: path.basename(filePath),
        created_at: new Date().toISOString()
      });
    }
  }
  
  return questions;
}

// Process individual questions (Math, Science, History)
async function processIndividualQuestions(filePath, subjectCode) {
  console.log(`Processing ${subjectCode} file: ${filePath}`);
  
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const questions = [];
  
  for (const line of lines) {
    try {
      const question = JSON.parse(line);
      
      // Skip invalid questions
      if (!question.enunciado || !question.opciones || Object.keys(question.opciones).length === 0) {
        continue;
      }
      
      // Determine correct answer from options structure
      let correctAnswer = 'A';
      if (question.respuesta_correcta) {
        correctAnswer = question.respuesta_correcta.toUpperCase();
      }
      
      questions.push({
        id: `${subjectCode}_${question.numero || Math.random().toString(36)}`,
        subject: subjectCode,
        content: question.enunciado,
        options: question.opciones,
        correct_answer: correctAnswer,
        explanation: question.explicacion || '',
        area_tematica: question.area_tematica || 'General',
        tema: question.tema || 'Sin clasificar',
        habilidad: question.habilidad || 'resolver problemas',
        difficulty: question.difficulty || 3,
        page: question.page,
        numero_pregunta: question.numero,
        has_images: question.imagenes ? question.imagenes.length > 0 : false,
        image_refs: question.imagenes || [],
        active: true,
        source_file: path.basename(filePath),
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn(`Error parsing line in ${filePath}:`, error.message);
    }
  }
  
  return questions;
}

// Main consolidation function
async function consolidateAllQuestions() {
  console.log('Starting question consolidation...');
  
  const temario = await loadTemario();
  const allQuestions = [];
  
  // Process different directories
  const directories = [
    '/Users/alfil/Mi unidad/5_PAES/TUPAES/Pruebas/processed',
    '/Users/alfil/Mi unidad/5_PAES/TUPAES/Pruebas/raw/L/output',
    '/Users/alfil/Mi unidad/5_PAES/TUPAES/Pruebas/json'
  ];
  
  for (const dir of directories) {
    try {
      const files = await fs.readdir(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isDirectory()) {
          // Handle subdirectories (like L output folders)
          if (dir.includes('/L/output')) {
            const subFiles = await fs.readdir(filePath);
            const jsonFile = subFiles.find(f => f === 'lecturas_y_preguntas.json');
            if (jsonFile) {
              const questions = await processLanguageQuestions(path.join(filePath, jsonFile));
              allQuestions.push(...questions);
            }
          }
          continue;
        }
        
        // Process individual files
        if (file.endsWith('_enriched.jsonl')) {
          // Determine subject from filename
          let subjectCode = 'UNKNOWN';
          if (file.includes('M1-') || file.includes('M-')) subjectCode = 'M1';
          else if (file.includes('M2-')) subjectCode = 'M2';
          else if (file.includes('L-')) subjectCode = 'L';
          else if (file.includes('H-')) subjectCode = 'H';
          else if (file.includes('C-biologia')) subjectCode = 'CB';
          else if (file.includes('C-fisica')) subjectCode = 'CF';
          else if (file.includes('C-quimica')) subjectCode = 'CQ';
          
          if (subjectCode !== 'UNKNOWN' && subjectCode !== 'L') {
            const questions = await processIndividualQuestions(filePath, subjectCode);
            allQuestions.push(...questions);
          }
        }
      }
    } catch (error) {
      console.warn(`Error processing directory ${dir}:`, error.message);
    }
  }
  
  console.log(`Total questions consolidated: ${allQuestions.length}`);
  
  // Group by subject for analysis
  const subjectCounts = {};
  allQuestions.forEach(q => {
    subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
  });
  
  console.log('Questions by subject:', subjectCounts);
  
  // Save consolidated questions
  const outputPath = '/Users/alfil/Mi unidad/5_PAES/TUPAES/project/consolidated_questions.json';
  await fs.writeFile(outputPath, JSON.stringify(allQuestions, null, 2));
  
  console.log(`Consolidated questions saved to: ${outputPath}`);
  return allQuestions;
}

// Validate and import to Supabase
async function importToSupabase(questions) {
  console.log('Starting Supabase import...');
  
  const batchSize = 50;
  let imported = 0;
  let errors = 0;
  
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert(batch)
        .select('id');
      
      if (error) {
        console.error(`Batch ${Math.floor(i/batchSize) + 1} error:`, error);
        errors += batch.length;
      } else {
        imported += data.length;
        console.log(`Imported batch ${Math.floor(i/batchSize) + 1}: ${data.length} questions`);
      }
    } catch (error) {
      console.error(`Batch ${Math.floor(i/batchSize) + 1} exception:`, error);
      errors += batch.length;
    }
  }
  
  console.log(`Import completed: ${imported} imported, ${errors} errors`);
  return { imported, errors };
}

// Execute if run directly
const isMainModule = process.argv[1] && process.argv[1].endsWith('consolidateQuestions.js');

if (isMainModule) {
  try {
    const questions = await consolidateAllQuestions();
    
    // Ask user if they want to import to Supabase
    const shouldImport = process.argv.includes('--import');
    
    if (shouldImport) {
      await importToSupabase(questions);
    } else {
      console.log('To import to Supabase, run with --import flag');
    }
  } catch (error) {
    console.error('Error in consolidation:', error);
    process.exit(1);
  }
}

export { consolidateAllQuestions, importToSupabase };