import fs from 'fs/promises';
import path from 'path';

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Directorio creado: ${dirPath}`);
  }
}

async function copyFile(sourcePath, targetPath) {
  try {
    const content = await fs.readFile(sourcePath, 'utf-8');
    await fs.writeFile(targetPath, content, 'utf-8');
    console.log(`Archivo copiado exitosamente a: ${targetPath}`);
    return targetPath;
  } catch (error) {
    console.error(`Error copiando archivo: ${error.message}`);
    throw error;
  }
}

async function transformQuestions(inputPath, outputPath) {
  try {
    // Asegurar que el directorio content existe
    await ensureDirectoryExists('content');

    // Copiar archivo de entrada a content si no está ahí
    const fileName = path.basename(inputPath);
    const contentPath = path.join('content', fileName);
    
    let finalInputPath = inputPath;
    if (!inputPath.startsWith('content/')) {
      console.log(`Copiando archivo de entrada a: ${contentPath}`);
      finalInputPath = await copyFile(inputPath, contentPath);
    }

    console.log(`Leyendo archivo: ${finalInputPath}`);
    const fileContent = await fs.readFile(finalInputPath, 'utf-8');
    const data = JSON.parse(fileContent);

    if (!data.preguntas || !Array.isArray(data.preguntas)) {
      throw new Error('El archivo debe contener un array de preguntas en la propiedad "preguntas"');
    }

    const transformedQuestions = data.preguntas.map(question => {
      if (!question.texto || !question.alternativas || !question.correcta) {
        throw new Error(`Pregunta inválida: ${JSON.stringify(question)}`);
      }

      // Extraer la letra correcta y convertirla a minúscula
      const correctLetter = question.correcta.toLowerCase();

      // Validar que la respuesta correcta sea válida
      if (!['a', 'b', 'c', 'd'].includes(correctLetter)) {
        throw new Error(`Respuesta correcta inválida: ${question.correcta}`);
      }

      // Validar que haya exactamente 4 alternativas
      if (!Array.isArray(question.alternativas) || question.alternativas.length !== 4) {
        throw new Error(`Número incorrecto de alternativas: ${question.alternativas?.length}`);
      }

      // Limpiar las alternativas y crear el objeto de opciones
      const options = {};
      question.alternativas.forEach((alt, index) => {
        const letter = String.fromCharCode(97 + index); // a, b, c, d
        const cleanOption = alt.replace(/^[A-E][\)\.]\s*/, '').trim();
        if (!cleanOption) {
          throw new Error(`Alternativa vacía en pregunta: ${question.id}`);
        }
        options[letter] = cleanOption;
      });

      // Limpiar el texto de la pregunta
      const cleanContent = question.texto
        .replace(/^\d+\.\s*/, '') // Remover número al inicio
        .replace(/\n+/g, ' ') // Reemplazar múltiples saltos de línea por espacio
        .trim();

      if (!cleanContent) {
        throw new Error(`Contenido de pregunta vacío: ${question.id}`);
      }

      // Validar y ajustar la materia
      const subject = question.materia;
      if (!['M1', 'M2', 'L', 'CB', 'CF', 'CQ', 'H'].includes(subject)) {
        throw new Error(`Materia inválida: ${subject}`);
      }

      // Validar área temática según la materia
      const areaTematica = question.area_tematica;
      if (!areaTematica) {
        throw new Error(`Área temática faltante en pregunta: ${question.id}`);
      }

      // Asegurar que el tema y subtema no sean undefined
      const tema = question.tema || null;
      const subtema = question.subtema || null;

      // Validar y ajustar la dificultad
      let difficulty = parseInt(question.dificultad) || 2;
      difficulty = Math.max(1, Math.min(5, difficulty)); // Asegurar que esté entre 1 y 5

      // Validar que exista una explicación
      const explanation = question.explicacion?.trim() || "Explicación pendiente";
      if (explanation === "Explicación pendiente") {
        console.warn(`Advertencia: Pregunta ${question.id} no tiene explicación`);
      }

      return {
        id: question.id,
        subject,
        content: cleanContent,
        options,
        correct_answer: correctLetter,
        explanation,
        area_tematica: areaTematica,
        tema,
        subtema,
        difficulty,
        active: true,
        created_at: question.created_at || new Date().toISOString()
      };
    });

    // Guardar el archivo transformado
    await fs.writeFile(
      outputPath,
      JSON.stringify(transformedQuestions, null, 2),
      'utf-8'
    );

    console.log(`Transformación completada. Archivo guardado en: ${outputPath}`);
    console.log(`Total de preguntas transformadas: ${transformedQuestions.length}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Error: No se encontró el archivo ${inputPath}`);
      console.error('Asegúrate de que el archivo existe en la ruta especificada.');
    } else {
      console.error('Error durante la transformación:', error);
    }
    process.exit(1);
  }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Uso: node transformQuestions.js <archivo-entrada.json> <archivo-salida.json>');
  process.exit(1);
}

const [inputPath, outputPath] = args;
transformQuestions(inputPath, outputPath);