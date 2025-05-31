import fs from 'fs/promises';
import { QUESTION_TEMPLATES, QUALITY_CRITERIA } from './questionTemplates.js';

// Configuración
const CONFIG = {
  QUESTIONS_PER_SUBJECT: 100,
  OUTPUT_FILE: 'synthetic_questions_demo.json',
  VALIDATION_ENABLED: true
};

class SyntheticQuestionGenerator {
  constructor() {
    this.generatedQuestions = [];
    this.questionCounter = 0;
  }

  async initialize() {
    console.log('🚀 Inicializando generador de preguntas sintéticas...\n');
    
    // Para esta demostración, usaremos templates predefinidos
    console.log('✅ Generador inicializado correctamente');
    return true;
  }

  generateQuestionFromTemplate(subject, area, tema, templateInput) {
    this.questionCounter++;
    
    // Templates de preguntas sintéticas por materia
    const syntheticTemplates = {
      'M1': [
        {
          content: `Si f(x) = {a}x + {b}, ¿cuál es el valor de f({c})?`,
          explanation: `f({c}) = {a}({c}) + {b} = {result}`,
          area_tematica: "Álgebra y funciones",
          tema: "Evaluación de funciones"
        },
        {
          content: `Un rectángulo tiene un perímetro de {perimeter} metros. Si el ancho es {width} metros, ¿cuál es la longitud?`,
          explanation: `Perímetro = 2(largo + ancho). Entonces: {perimeter} = 2(largo + {width}). Resolviendo: largo = {result}`,
          area_tematica: "Geometría",
          tema: "Perímetros y áreas"
        },
        {
          content: `¿Cuál es el resultado de ({a})² + ({b})²?`,
          explanation: `({a})² + ({b})² = {asq} + {bsq} = {result}`,
          area_tematica: "Números",
          tema: "Operaciones con potencias"
        }
      ],
      'M2': [
        {
          content: `Si log₂(x) = {exp}, ¿cuál es el valor de x?`,
          explanation: `Por definición de logaritmo: x = 2^{exp} = {result}`,
          area_tematica: "Álgebra y funciones",
          tema: "Logaritmos"
        },
        {
          content: `¿Cuál es la derivada de f(x) = {a}x² + {b}x + {c}?`,
          explanation: `f'(x) = {da}x + {b}`,
          area_tematica: "Álgebra y funciones", 
          tema: "Derivadas"
        }
      ],
      'L': [
        {
          content: `¿Cuál es la idea principal del texto?`,
          explanation: `El texto presenta principalmente la información sobre el tema central desarrollado en los párrafos.`,
          area_tematica: "Comprensión Lectora",
          tema: "Identificación de ideas principales",
          reading_context: {
            titulo: "Texto Sintético {n}",
            texto: "En el contexto actual de la educación chilena, es fundamental comprender los diversos aspectos que influyen en el desarrollo académico de los estudiantes. Los procesos de aprendizaje se ven afectados por múltiples factores, incluyendo el entorno familiar, las metodologías de enseñanza y los recursos disponibles. La preparación para evaluaciones estandarizadas como el PAES requiere un enfoque integral que considere tanto los contenidos específicos como las habilidades de razonamiento crítico. Los estudiantes deben desarrollar estrategias efectivas de estudio que les permitan abordar diferentes tipos de preguntas y contextos evaluativos.",
            numero_lectura: 1
          }
        }
      ],
      'CB': [
        {
          content: `Un grupo de estudiantes realizó un experimento para determinar el efecto de diferentes concentraciones de glucosa en la respiración celular. Los resultados muestran que a mayor concentración de glucosa, mayor es la producción de CO₂. ¿Qué proceso explica mejor este resultado?`,
          explanation: `La respiración celular utiliza glucosa como sustrato principal, por lo que una mayor concentración de glucosa permite mayor actividad metabólica y mayor producción de CO₂.`,
          area_tematica: "Procesos y funciones biológicas",
          tema: "Respiración celular"
        }
      ],
      'CF': [
        {
          content: `Un objeto de {mass} kg se desliza sobre una superficie horizontal con una velocidad inicial de {vel} m/s. Si el coeficiente de fricción es {friction}, ¿cuál es la aceleración del objeto?`,
          explanation: `La fuerza de fricción es F = μ × N = {friction} × {mass} × 9.8 = {fforce} N. La aceleración es a = F/m = {result} m/s²`,
          area_tematica: "Mecánica",
          tema: "Dinámica"
        }
      ],
      'CQ': [
        {
          content: `En una reacción de combustión completa del metano (CH₄) con oxígeno (O₂), ¿cuáles son los productos principales de la reacción?`,
          explanation: `La combustión completa del metano produce CO₂ + H₂O según la ecuación: CH₄ + 2O₂ → CO₂ + 2H₂O`,
          area_tematica: "Reacciones químicas y estequiometría",
          tema: "Reacciones de combustión"
        }
      ],
      'H': [
        {
          content: `Durante el período de la Independencia de Chile (1810-1823), uno de los principales desafíos que enfrentó el proceso independentista fue la organización del nuevo Estado. En este contexto, ¿cuál fue el principal objetivo de la Constitución de 1818?`,
          explanation: `La Constitución de 1818 buscaba establecer un marco jurídico e institucional para el nuevo Estado independiente, definiendo la organización política y los derechos fundamentales.`,
          area_tematica: "Historia",
          tema: "Independencia de Chile"
        }
      ]
    };

    const templates = syntheticTemplates[subject] || [];
    if (templates.length === 0) return null;

    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Generar valores aleatorios para variables
    const values = this.generateRandomValues(subject);
    
    let question = {
      id: `${subject}_synthetic_${this.questionCounter}`,
      subject: subject,
      source: 'synthetic',
      content: this.fillTemplate(template.content, values),
      explanation: this.fillTemplate(template.explanation, values),
      area_tematica: template.area_tematica,
      tema: template.tema,
      difficulty: 3,
      correct_answer: 'a'
    };

    // Agregar contexto de lectura para Lenguaje
    if (template.reading_context) {
      question.reading_context = {
        ...template.reading_context,
        titulo: template.reading_context.titulo.replace('{n}', this.questionCounter),
        numero_lectura: this.questionCounter
      };
    }

    // Generar opciones
    question.options = this.generateOptions(subject, values);

    return question;
  }

  generateRandomValues(subject) {
    const values = {};
    
    switch (subject) {
      case 'M1':
      case 'M2':
        values.a = Math.floor(Math.random() * 9) + 1;
        values.b = Math.floor(Math.random() * 20) - 10;
        values.c = Math.floor(Math.random() * 10) + 1;
        values.result = values.a * values.c + values.b;
        values.asq = values.a * values.a;
        values.bsq = values.b * values.b;
        values.perimeter = (Math.floor(Math.random() * 10) + 10) * 4;
        values.width = Math.floor(Math.random() * 15) + 5;
        values.exp = Math.floor(Math.random() * 5) + 1;
        values.da = 2 * values.a;
        break;
      case 'CF':
        values.mass = Math.floor(Math.random() * 10) + 1;
        values.vel = Math.floor(Math.random() * 20) + 5;
        values.friction = (Math.random() * 0.5 + 0.1).toFixed(1);
        values.fforce = (values.friction * values.mass * 9.8).toFixed(1);
        values.result = (-values.fforce / values.mass).toFixed(1);
        break;
    }
    
    return values;
  }

  fillTemplate(template, values) {
    let result = template;
    Object.entries(values).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    return result;
  }

  generateOptions(subject, values) {
    const options = { a: '', b: '', c: '', d: '' };
    
    if (subject === 'M1' || subject === 'M2') {
      const correct = values.result;
      options.a = correct.toString();
      options.b = (correct + Math.floor(Math.random() * 10) + 1).toString();
      options.c = (correct - Math.floor(Math.random() * 10) - 1).toString();
      options.d = (correct + Math.floor(Math.random() * 20) + 10).toString();
    } else if (subject === 'L') {
      options.a = "Presenta el tema central del texto";
      options.b = "Introduce personajes secundarios";
      options.c = "Describe aspectos ambientales";
      options.d = "Plantea conclusiones finales";
    } else if (subject === 'CB') {
      options.a = "Respiración celular";
      options.b = "Fotosíntesis";
      options.c = "Fermentación";
      options.d = "Digestión celular";
    } else if (subject === 'CF') {
      options.a = values.result ? `${values.result} m/s²` : "2.5 m/s²";
      options.b = "3.2 m/s²";
      options.c = "1.8 m/s²";
      options.d = "4.1 m/s²";
    } else if (subject === 'CQ') {
      options.a = "CO₂ y H₂O";
      options.b = "CO y H₂O";
      options.c = "C y H₂O₂";
      options.d = "CH₂O y O₂";
    } else if (subject === 'H') {
      options.a = "Organizar el nuevo Estado independiente";
      options.b = "Establecer relaciones con España";
      options.c = "Crear alianzas militares";
      options.d = "Desarrollar el comercio exterior";
    }
    
    return options;
  }

  async generateQuestionsForSubject(subject) {
    console.log(`📚 Generando preguntas para ${subject}...`);
    
    const questions = [];
    const questionsToGenerate = Math.min(CONFIG.QUESTIONS_PER_SUBJECT, 100);
    
    for (let i = 0; i < questionsToGenerate; i++) {
      const question = this.generateQuestionFromTemplate(
        subject, 
        'Área general', 
        'Tema general', 
        {}
      );
      
      if (question && this.validateQuestion(question, subject)) {
        questions.push(question);
      }
    }
    
    console.log(`  ✅ Generadas ${questions.length} preguntas para ${subject}`);
    return questions;
  }

  validateQuestion(question, subject) {
    if (!CONFIG.VALIDATION_ENABLED) return true;
    
    // Validaciones básicas
    if (!question.content || question.content.length < 20) {
      return false;
    }

    if (!question.options || Object.keys(question.options).length !== 4) {
      return false;
    }

    if (!['a', 'b', 'c', 'd'].includes(question.correct_answer)) {
      return false;
    }

    return true;
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
    console.log(`\n💾 Preguntas guardadas en ${CONFIG.OUTPUT_FILE}`);
  }

  generateReport() {
    console.log('\n📊 REPORTE DE GENERACIÓN:');
    console.log('================================');
    
    const bySubject = {};
    this.generatedQuestions.forEach(q => {
      bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
    });

    Object.entries(bySubject).forEach(([subject, count]) => {
      console.log(`${subject}: ${count} preguntas sintéticas`);
    });

    console.log(`\nTOTAL: ${this.generatedQuestions.length} preguntas sintéticas generadas`);
    console.log('\n🎯 SIGUIENTES PASOS:');
    console.log('1. ✅ Preguntas sintéticas creadas exitosamente');
    console.log('2. 🔄 Integrar con el sistema principal de preguntas');
    console.log('3. 🧪 Probar calidad y dificultad de las preguntas');
    console.log('4. 📊 Agregar a la base de datos de producción');
  }
}

// Función principal
async function main() {
  console.log('🎯 GENERADOR DE PREGUNTAS SINTÉTICAS PAES\n');
  console.log('Creando 100 preguntas por materia usando templates...\n');
  
  const generator = new SyntheticQuestionGenerator();
  
  console.log('Inicializando generador...');
  const initialized = await generator.initialize();
  if (!initialized) {
    console.error('❌ Error inicializando generador');
    return;
  }

  console.log('Generando todas las preguntas...');
  await generator.generateAllQuestions();
  
  console.log('\n🚀 ¡Generación completada exitosamente!');
  console.log(`📁 Archivo generado: ${CONFIG.OUTPUT_FILE}`);
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SyntheticQuestionGenerator };