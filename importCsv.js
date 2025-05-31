// importCsv.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lee variables de entorno
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en el .env");
  process.exit(1);
}

// Crea cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Importa un CSV y lo inserta (o actualiza) en la tabla dada.
 * @param {string} csvFilePath - Ruta al archivo CSV.
 * @param {string} tableName - Nombre de la tabla en Supabase.
 * @param {(row: any) => any} transformFn - Función para mapear campos del CSV a columnas de la tabla.
 */
async function importCsvToSupabase(csvFilePath, tableName, transformFn) {
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', async () => {
        try {
          // Aplica la transformación para mapear columnas
          const dataToUpsert = results.map(transformFn);

          // Usamos upsert para que si existe un id, se actualice en vez de duplicarse
          const { data, error } = await supabase
            .from(tableName)
            .upsert(dataToUpsert, { onConflict: 'id' });

          if (error) {
            console.error("Error al upsertar:", error);
            reject(error);
          } else {
            console.log(`Importación exitosa a la tabla '${tableName}'`, data);
            resolve(data);
          }
        } catch (err) {
          console.error("Error procesando el CSV:", err);
          reject(err);
        }
      })
      .on('error', (err) => {
        console.error("Error leyendo el CSV:", err);
        reject(err);
      });
  });
}

// EJEMPLO DE USO:
// Supongamos que tu CSV tiene columnas: id, subject, content, options, correct_answer, ...
// Y tu tabla en Supabase se llama "questions_cb" (como en tu screenshot).
// Ajusta transformFn para mapear exactamente las columnas que tengas en el CSV a las columnas de tu tabla.

(async () => {
  try {
    // 1. Importar CB
    const cbCsvPath = path.join(__dirname, 'cb_question_bank.csv');
    await importCsvToSupabase(cbCsvPath, 'questions_cb', (row) => ({
      id: row.id,                    // si tu CSV tiene una columna "id"
      subject: row.subject,
      content: row.content,
      options: row.options,          // si tu tabla es JSON, verifica que sea stringifiable
      correct_answer: row.correct_answer,
      explanation: row.explanation,
      difficulty: row.difficulty,
      active: row.active === 'true', // si la columna es booleana, conviertele
      // ... mapea las demás columnas
    }));

    // 2. Importar M1
    const m1CsvPath = path.join(__dirname, 'm1_question_bank.csv');
    await importCsvToSupabase(m1CsvPath, 'questions_m1', (row) => ({
      id: row.id,
      texto: row.texto,
      alternativas: row.alternativas, // ...
      correcta: row.correcta,
      // ... etc.
    }));

    // Agrega más si tienes otros CSVs...
  } catch (error) {
    console.error("Error general:", error);
  }
})();