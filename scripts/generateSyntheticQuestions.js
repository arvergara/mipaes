import fs from 'fs/promises';
import { QUESTION_TEMPLATES, QUALITY_CRITERIA } from './questionTemplates.js';

// Configuración del generador
const CONFIG = {
  QUESTIONS_PER_SUBJECT: 100,
  QUESTIONS_PER_AREA: 25,
  AI_MODEL: 'claude-3-sonnet', // O el modelo que prefieras
  OUTPUT_FILE: 'synthetic_questions.json',
  VALIDATION_ENABLED: true
};

class SyntheticQuestionGenerator {
  constructor() {
    this.temarioData = null;
    this.existingQuestions = null;
    this.generatedQuestions = [];
  }

  async initialize() {
    console.log('🚀 Inicializando generador de preguntas sintéticas...\n');
    
    // Cargar temario
    try {
      const temarioCSV = await fs.readFile('/Users/alfil/Mi unidad/5_PAES/VibeCoding/temario_paes_vs.csv', 'utf-8');
      this.temarioData = this.parseTemarioCSV(temarioCSV);
    } catch (error) {
      console.error('❌ Error cargando temario:', error.message);
      return false;
    }

    // Cargar preguntas existentes para evitar duplicados
    try {
      const questionsFile = await fs.readFile('public/consolidated_questions.json', 'utf-8');
      this.existingQuestions = JSON.parse(questionsFile);
    } catch (error) {
      console.warn('⚠️ No se pudieron cargar preguntas existentes');
      this.existingQuestions = [];
    }

    console.log('✅ Generador inicializado correctamente');
    return true;
  }

  parseTemarioCSV(csvContent) {
    const lines = csvContent.split('\\n').slice(1); // Skip header
    const temario = {};

    lines.forEach(line => {
      if (!line.trim()) return;
      
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
    });

    return temario;
  }

  async generateQuestionsForSubject(subject) {
    console.log(`\\n📚 Generando preguntas para ${subject}...`);
    
    const subjectData = this.temarioData[subject];
    if (!subjectData) {
      console.error(`❌ No se encontró temario para ${subject}`);
      return [];
    }

    const templates = QUESTION_TEMPLATES[subject];
    if (!templates) {
      console.error(`❌ No se encontraron templates para ${subject}`);
      return [];
    }

    const questions = [];
    const areas = Object.keys(subjectData);

    for (const area of areas) {
      const temas = subjectData[area];
      console.log(`  📝 Área: ${area} (${temas.length} temas)`);

      for (const temaObj of temas) {
        const questionsForTema = await this.generateQuestionsForTema(
          subject, 
          area, 
          temaObj.tema, 
          templates
        );
        questions.push(...questionsForTema);
      }
    }

    console.log(`  ✅ Generadas ${questions.length} preguntas para ${subject}`);
    return questions;
  }

  async generateQuestionsForTema(subject, area, tema, templates) {
    const questionsToGenerate = Math.min(5, CONFIG.QUESTIONS_PER_AREA); // 5 por tema máximo
    const questions = [];

    for (let i = 0; i < questionsToGenerate; i++) {
      // Seleccionar template aleatorio
      const template = templates.templates[Math.floor(Math.random() * templates.templates.length)];
      
      // Preparar prompt
      const prompt = this.preparePrompt(template.prompt, subject, area, tema);
      
      // Generar pregunta (simulado - aquí integrarías con tu API de IA)
      const question = await this.callAIModel(prompt, subject);
      
      if (question && this.validateQuestion(question, subject)) {
        question.id = `${subject}_synthetic_${Date.now()}_${i}`;
        question.subject = subject;
        question.source = 'synthetic';
        question.template_type = template.type;
        questions.push(question);
      }
    }

    return questions;
  }

  preparePrompt(template, subject, area, tema) {
    // Obtener palabras clave del análisis previo
    const keywords = this.getKeywordsForSubject(subject);
    
    return template
      .replace(/{area_tematica}/g, area)
      .replace(/{tema}/g, tema)
      .replace(/{keywords}/g, keywords.join(', '));
  }

  getKeywordsForSubject(subject) {
    const keywordMap = {
      'M1': ['función', 'ecuación', 'valor', 'determina', 'variable'],
      'M2': ['valor', 'determina', 'función', 'calcula', 'ecuación'],
      'L': ['narrador', 'texto', 'párrafo', 'autor', 'idea'],
      'CB': ['resultado', 'experimento', 'hipótesis', 'proceso', 'análisis'],
      'CF': ['experimento', 'hipótesis', 'resultado', 'proceso', 'análisis'],
      'CQ': ['proceso', 'experimento', 'hipótesis', 'resultado', 'análisis'],
      'H': ['período', 'proceso', 'contexto', 'desarrollo', 'cambio']
    };
    
    return keywordMap[subject] || [];
  }

  async callAIModel(prompt, subject) {
    // SIMULACIÓN - En producción conectarías con Claude/GPT/etc
    console.log(`    🤖 Generando pregunta para ${subject}...`);
    
    // Por ahora retornamos una pregunta de ejemplo
    const exampleQuestion = this.generateExampleQuestion(subject);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return exampleQuestion;
  }

  generateExampleQuestion(subject) {
    const examples = {
      'M1': {
        content: "Si f(x) = 3x + 2, ¿cuál es el valor de f(4)?",
        options: {
          a: "14",
          b: "12", 
          c: "10",
          d: "16"
        },
        correct_answer: "a",
        explanation: "f(4) = 3(4) + 2 = 12 + 2 = 14",
        area_tematica: "Álgebra y funciones",
        tema: "Evaluación de funciones",
        difficulty: 3
      },
      'L': {
        content: "¿Cuál es la idea principal del primer párrafo?",
        options: {
          a: "Presenta el tema central",
          b: "Introduce los personajes",
          c: "Describe el ambiente",
          d: "Plantea el conflicto"
        },
        correct_answer: "a",
        explanation: "El primer párrafo típicamente presenta el tema central del texto",
        area_tematica: "Comprensión Lectora",
        tema: "Identificación de ideas principales",
        reading_context: {
          titulo: "Texto de ejemplo",
          texto: "Este es un texto de ejemplo para demostrar la estructura...",
          numero_lectura: 1
        },
        difficulty: 3
      }
      // Agregar ejemplos para otras materias...
    };

    return examples[subject] || examples['M1'];
  }

  validateQuestion(question, subject) {
    if (!CONFIG.VALIDATION_ENABLED) return true;
    
    const criteria = QUALITY_CRITERIA[subject];
    if (!criteria) return true;

    // Validar longitud
    const contentLength = question.content?.length || 0;
    if (contentLength < criteria.minLength || contentLength > criteria.maxLength) {
      console.warn(`    ⚠️ Pregunta rechazada: longitud ${contentLength} fuera del rango`);
      return false;
    }

    // Validar palabras prohibidas
    const content = question.content?.toLowerCase() || '';
    for (const forbidden of criteria.forbiddenWords) {
      if (content.includes(forbidden)) {
        console.warn(`    ⚠️ Pregunta rechazada: contiene palabra prohibida "${forbidden}"`);
        return false;
      }
    }

    // Validar que tenga 4 opciones
    if (!question.options || Object.keys(question.options).length !== 4) {
      console.warn(`    ⚠️ Pregunta rechazada: no tiene exactamente 4 opciones`);
      return false;
    }

    return true;
  }

  checkForDuplicates(newQuestion) {
    // Verificar similitud con preguntas existentes
    const similarity = this.calculateSimilarity(newQuestion.content, this.existingQuestions);
    return similarity < 0.8; // 80% de similitud máxima
  }

  calculateSimilarity(text1, existingQuestions) {
    // Implementación simple de similitud (Jaccard)
    const words1 = new Set(text1.toLowerCase().split(/\\s+/));
    
    let maxSimilarity = 0;
    for (const q of existingQuestions) {
      if (!q.content) continue;
      
      const words2 = new Set(q.content.toLowerCase().split(/\\s+/));
      const intersection = new Set([...words1].filter(x => words2.has(x)));
      const union = new Set([...words1, ...words2]);
      
      const similarity = intersection.size / union.size;
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
    
    return maxSimilarity;
  }

  async generateAllQuestions() {
    const subjects = ['M1', 'M2', 'L', 'CB', 'CF', 'CQ', 'H'];
    
    for (const subject of subjects) {
      const questions = await this.generateQuestionsForSubject(subject);
      this.generatedQuestions.push(...questions);
    }

    // Guardar resultados
    await this.saveQuestions();
    this.generateReport();
  }

  async saveQuestions() {
    await fs.writeFile(CONFIG.OUTPUT_FILE, JSON.stringify(this.generatedQuestions, null, 2));
    console.log(`\\n💾 Preguntas guardadas en ${CONFIG.OUTPUT_FILE}`);
  }

  generateReport() {
    console.log('\\n📊 REPORTE DE GENERACIÓN:');
    console.log('================================');
    
    const bySubject = {};
    this.generatedQuestions.forEach(q => {
      bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
    });

    Object.entries(bySubject).forEach(([subject, count]) => {
      console.log(`${subject}: ${count} preguntas sintéticas`);
    });

    console.log(`\\nTOTAL: ${this.generatedQuestions.length} preguntas sintéticas generadas`);
    console.log('\\n🎯 PRÓXIMOS PASOS:');
    console.log('1. Revisar calidad de las preguntas generadas');
    console.log('2. Integrar con API de IA real (Claude/GPT)');
    console.log('3. Implementar validación automática de contenido');
    console.log('4. Agregar a la base de datos principal');
  }
}

// Función principal
async function main() {
  const generator = new SyntheticQuestionGenerator();
  
  const initialized = await generator.initialize();
  if (!initialized) {
    console.error('❌ Error inicializando generador');
    return;
  }

  await generator.generateAllQuestions();
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SyntheticQuestionGenerator };