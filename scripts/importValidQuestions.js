import "dotenv/config";
import fs from 'fs/promises';
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

async function importValidQuestions(filePath) {
  try {
    console.log(`Reading file: ${filePath}`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const allQuestions = JSON.parse(fileContent);

    console.log(`Found ${allQuestions.length} total questions`);
    
    // Filter only valid questions with proper structure
    const validQuestions = allQuestions.filter(q => {
      // Basic validation - must have content and some options
      if (!q.content || !q.options || typeof q.options !== 'object') {
        return false;
      }
      
      // Must have at least 2 options for multiple choice
      const optionKeys = Object.keys(q.options);
      if (optionKeys.length < 2) {
        return false;
      }
      
      // Must have a subject
      if (!q.subject) {
        return false;
      }
      
      return true;
    });

    console.log(`Filtered to ${validQuestions.length} valid questions`);
    
    // Prepare questions for Supabase - adapt to existing schema
    const preparedQuestions = validQuestions.map(q => {
      // Ensure correct_answer has a default value
      let correctAnswer = q.correct_answer || 'A';
      if (!['A', 'B', 'C', 'D', 'a', 'b', 'c', 'd'].includes(correctAnswer)) {
        correctAnswer = 'A';
      }
      
      // Prepare the question object for Supabase
      const prepared = {
        subject: q.subject,
        content: q.content,
        options: q.options,
        correct_answer: correctAnswer.toUpperCase(),
        explanation: q.explanation || '',
        area_tematica: q.area_tematica || 'General',
        tema: q.tema || 'Sin clasificar',
        difficulty: q.difficulty || 3,
        active: true,
        created_at: new Date().toISOString()
      };
      
      // Add reading context for Language questions
      if (q.reading_context) {
        prepared.reading_context = q.reading_context;
      }
      
      // Add additional metadata
      if (q.habilidad) prepared.habilidad = q.habilidad;
      if (q.page) prepared.page = q.page;
      if (q.numero_pregunta) prepared.numero_pregunta = q.numero_pregunta;
      if (q.has_images) prepared.has_images = q.has_images;
      if (q.image_refs) prepared.image_refs = q.image_refs;
      if (q.source_file) prepared.source_file = q.source_file;
      
      return prepared;
    });

    // Import in batches
    const batchSize = 50;
    let imported = 0;
    let errors = 0;
    
    console.log(`Starting import in batches of ${batchSize}...`);
    
    for (let i = 0; i < preparedQuestions.length; i += batchSize) {
      const batch = preparedQuestions.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      try {
        console.log(`Importing batch ${batchNumber} (${batch.length} questions)...`);
        
        const { data, error } = await supabase
          .from('questions')
          .insert(batch)
          .select('id');

        if (error) {
          console.error(`Batch ${batchNumber} error:`, error.message);
          errors += batch.length;
          
          // Try importing one by one to identify specific issues
          console.log(`Trying individual imports for batch ${batchNumber}...`);
          for (const question of batch) {
            try {
              const { data: singleData, error: singleError } = await supabase
                .from('questions')
                .insert([question])
                .select('id');
              
              if (singleError) {
                console.warn(`Question failed: ${question.subject} - ${question.content.substring(0, 50)}...`);
                console.warn(`Error: ${singleError.message}`);
              } else {
                imported += 1;
              }
            } catch (singleException) {
              console.warn(`Question exception: ${singleException.message}`);
            }
          }
        } else {
          imported += data.length;
          console.log(`Batch ${batchNumber} successful: ${data.length} questions imported`);
        }
      } catch (exception) {
        console.error(`Batch ${batchNumber} exception:`, exception.message);
        errors += batch.length;
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\\nImport completed:`);
    console.log(`- Imported: ${imported} questions`);
    console.log(`- Errors: ${errors} questions`);
    console.log(`- Success rate: ${((imported / validQuestions.length) * 100).toFixed(1)}%`);
    
    // Show subject breakdown
    const subjectCounts = {};
    preparedQuestions.forEach(q => {
      subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
    });
    
    console.log(`\\nQuestions by subject:`);
    Object.entries(subjectCounts).forEach(([subject, count]) => {
      console.log(`- ${subject}: ${count} questions`);
    });

    return { imported, errors, total: validQuestions.length };
  } catch (error) {
    console.error('Error during import:', error);
    throw error;
  }
}

// Get file path from command line
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node importValidQuestions.js <path-to-questions.json>');
  process.exit(1);
}

try {
  await importValidQuestions(filePath);
} catch (error) {
  console.error('Failed to import questions:', error);
  process.exit(1);
}