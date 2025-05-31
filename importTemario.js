import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import csv from "csv-parser";
import dotenv from "dotenv";
dotenv.config();

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase URL or Anon Key in environment variables");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function importTemarioData() {
  const csvFilePath = path.join(__dirname, "temario_paes_vf.csv");
  const rows = [];

  // Read and parse tab-separated CSV file
  fs.createReadStream(csvFilePath)
    .pipe(csv({ separator: "\t" }))
    .on("data", (row) => rows.push(row))
    .on("end", async () => {
      try {
        // Transform data to match temario table structure
        const transformedData = rows.map((row) => ({
          id: randomUUID(),
          subject: row.subject,
          area: row.area,
          theme: row.theme,
          subtheme: row.subtheme,
          dificultad: 1, // Default value
          activo: true, // Default value
        }));

        // Temporarily disable RLS for import
        await supabase.rpc("alter_table_disable_rls", {
          table_name: "temario",
        });

        // Upsert data into temario table
        const { data, error } = await supabase
          .from("temario")
          .upsert(transformedData);

        // Re-enable RLS
        await supabase.rpc("alter_table_enable_rls", { table_name: "temario" });

        if (error) throw error;
        console.log("Successfully imported temario data:", data);
      } catch (error) {
        console.error("Error importing temario data:", error);
      }
    });
}

importTemarioData();
