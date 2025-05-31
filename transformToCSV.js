import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV header matching Supabase questions table
const CSV_HEADER =
  "id,subject,content,options,correct_answer,explanation,habilidad,difficulty,created_at,active,area_tematica,tema,subtema\n";

function transformQuestionToCSV(q) {
  const isOldFormat =
    q.hasOwnProperty("texto") && q.hasOwnProperty("alternativas");

  const question = {
    id: q.id || randomUUID(),
    subject: isOldFormat ? q.materia : q.subject,
    content: isOldFormat ? q.texto : q.content,
    options: isOldFormat
      ? JSON.stringify({
          a: q.alternativas[0].replace(/^[A-Z]\)\s*/, ""),
          b: q.alternativas[1].replace(/^[A-Z]\)\s*/, ""),
          c: q.alternativas[2].replace(/^[A-Z]\)\s*/, ""),
          d: q.alternativas[3].replace(/^[A-Z]\)\s*/, ""),
        })
      : JSON.stringify(q.options),
    correct_answer: isOldFormat ? q.correcta.toLowerCase() : q.correct_answer,
    explanation: isOldFormat ? q.explicacion : q.explanation,
    habilidad: null,
    difficulty: q.difficulty || 1,
    created_at: q.created_at || new Date().toISOString(),
    active: true,
    area_tematica: null,
    tema: null,
    subtema: null,
  };

  return Object.values(question)
    .map((val) => `"${val?.toString().replace(/"/g, '""')}"`)
    .join(",");
}

async function processFile(inputFile, outputFile) {
  try {
    const jsonData = JSON.parse(fs.readFileSync(inputFile, "utf8"));
    let questions = Array.isArray(jsonData)
      ? jsonData
      : jsonData.preguntas || [];

    const csvContent = questions.map(transformQuestionToCSV).join("\n");
    fs.writeFileSync(outputFile, CSV_HEADER + csvContent);

    console.log(`Successfully converted ${inputFile} to ${outputFile}`);
  } catch (error) {
    console.error(`Error processing ${inputFile}:`, error);
  }
}

// Process all question bank files
const filesToProcess = [
  "h_question_bank.json",
  "l_question_bank.json",
  "m1_question_bank.json",
  "m2_question_bank.json",
];

filesToProcess.forEach((file) => {
  const inputPath = path.join(__dirname, file);
  const outputPath = path.join(__dirname, file.replace(".json", ".csv"));
  processFile(inputPath, outputPath);
});
