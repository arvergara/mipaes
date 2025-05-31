// updateQuestions.js

// Instala las dependencias con: npm install @supabase/supabase-js dotenv
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

// Para obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configura tus variables de entorno
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "Falta VITE_SUPABASE_URL o SUPABASE_SERVICE_KEY en las variables de entorno"
  );
  process.exit(1);
}

// Use service role key which bypasses RLS by default
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// No need for RLS bypass functions when using service role key
async function setupImportMode() {}
async function cleanupImportMode() {}

async function updateQuestionsFromFile(
  filePath,
  tableName,
  transformFn = (data) => data
) {
  // Setup temporary RLS bypass
  await setupImportMode();
  try {
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Asumimos que el JSON tiene una propiedad "preguntas" o es un array directo.
    let questions = [];
    if (Array.isArray(jsonData)) {
      questions = jsonData;
    } else if (jsonData.preguntas) {
      questions = jsonData.preguntas;
    } else {
      throw new Error("Formato JSON inesperado");
    }

    // Transforma cada objeto para adecuarlo al esquema de la tabla
    const formattedQuestions = questions.map(transformFn);

    // Utiliza upsert para insertar o actualizar en función de la clave primaria "id"
    const { data, error } = await supabase
      .from(tableName)
      .upsert(formattedQuestions, { onConflict: "id" });

    if (error) throw error;
    console.log(`Actualización en ${tableName} completada:`, data);
  } catch (error) {
    console.error("Error actualizando preguntas desde", filePath, error);
  } finally {
    // Clean up temporary RLS bypass
    await cleanupImportMode();
  }
}

// Generar UUID para nuevas preguntas
import { randomUUID } from "crypto";

// Transform function that always generates new UUIDs
function transformQuestion(q) {
  // Handle different question formats
  const isOldFormat =
    q.hasOwnProperty("texto") && q.hasOwnProperty("alternativas");

  return {
    id: randomUUID(), // Always generate new UUID
    subject: isOldFormat ? q.materia : q.subject,
    content: isOldFormat ? q.texto : q.content,
    options: isOldFormat
      ? {
          a: q.alternativas[0].replace(/^[A-Z]\)\s*/, ""),
          b: q.alternativas[1].replace(/^[A-Z]\)\s*/, ""),
          c: q.alternativas[2].replace(/^[A-Z]\)\s*/, ""),
          d: q.alternativas[3].replace(/^[A-Z]\)\s*/, ""),
        }
      : q.options,
    correct_answer: isOldFormat ? q.correcta.toLowerCase() : q.correct_answer,
    explanation: isOldFormat ? q.explicacion : q.explanation,
    habilidad: null, // Not in source files
    difficulty: q.difficulty || 1,
    created_at: q.created_at || new Date().toISOString(),
    active: true, // Default all to active
    area_tematica: null, // Not in source files
    tema: null, // Not in source files
    subtema: null, // Not in source files
  };
}

// Process files sequentially with error handling
async function processFiles() {
  const filesToProcess = [
    "h_question_bank.json",
    "l_question_bank.json",
    "m1_question_bank.json",
    "m2_question_bank.json",
  ];

  for (const file of filesToProcess) {
    try {
      console.log(`Processing ${file}...`);
      const filePath = path.join(__dirname, file);
      await updateQuestionsFromFile(filePath, "questions", transformQuestion);
      console.log(`Successfully processed ${file}`);
    } catch (error) {
      console.error(`Failed to process ${file}:`, error);
    }
  }
}

// Start processing
processFiles();
