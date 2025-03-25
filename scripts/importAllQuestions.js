import "dotenv/config";
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

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

const subjects = ['m1', 'm2', 'l', 'cb', 'h'];

async function importQuestions(questions) {
  try {
    // Process questions in batches of 10
    const batchSize = 10;
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      
      // Prepare questions for insertion
      const preparedQuestions = batch.map(q => ({
        ...q,
        active: true,
        created_at: new Date().toISOString()
      }));

      console.log(`Inserting batch of ${preparedQuestions.length} questions...`);
      const { data, error } = await supabase
        .from('questions')
        .insert(preparedQuestions)
        .select();

      if (error) {
        throw error;
      }

      console.log(`✓ ${data.length} questions inserted successfully`);
    }
  } catch (error) {
    console.error('Error during import:', error);
    throw error;
  }
}

async function importAllQuestions() {
  try {
    console.log('Starting import of all questions...');
    
    // Verify connection with Supabase
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    if (versionError) throw versionError;
    console.log('✓ Successfully connected to Supabase');

    let totalQuestions = 0;

    // Import questions for each subject
    for (const subject of subjects) {
      const filePath = `content/${subject}_transformed.json`;
      
      try {
        console.log(`\nReading file: ${filePath}`);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const questions = JSON.parse(fileContent);

        if (!Array.isArray(questions)) {
          throw new Error(`File ${filePath} does not contain an array of questions`);
        }

        console.log(`Found ${questions.length} questions for ${subject.toUpperCase()}`);
        await importQuestions(questions);
        totalQuestions += questions.length;
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.warn(`Warning: File ${filePath} not found`);
          continue;
        }
        throw error;
      }
    }

    console.log('\nImport completed successfully!');
    console.log(`Total questions imported: ${totalQuestions}`);

  } catch (error) {
    console.error('\nError during import:', error);
    process.exit(1);
  }
}

// Execute the import
importAllQuestions();