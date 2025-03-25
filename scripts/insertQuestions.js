import "dotenv/config";
import { createClient } from '@supabase/supabase-js';

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

// M1 Questions
const m1Questions = [
  {
    subject: 'M1',
    content: '¿Cuál es el resultado de simplificar la fracción 24/36?',
    options: {
      a: '1/2',
      b: '2/3',
      c: '3/4',
      d: '5/6'
    },
    correct_answer: 'b',
    explanation: 'Para simplificar 24/36, dividimos numerador y denominador por su máximo común divisor (12): 24÷12/36÷12 = 2/3',
    area_tematica: 'Números',
    tema: 'Conjunto de los números enteros y racionales',
    subtema: 'Operaciones con fracciones',
    difficulty: 2,
    active: true
  },
  {
    subject: 'M1',
    content: 'Si un producto cuesta $5.000 y se le aplica un 20% de descuento, ¿cuál es el precio final?',
    options: {
      a: '$3.000',
      b: '$3.500',
      c: '$4.000',
      d: '$4.500'
    },
    correct_answer: 'c',
    explanation: '20% de $5.000 = $1.000 (descuento). Precio final = $5.000 - $1.000 = $4.000',
    area_tematica: 'Números',
    tema: 'Porcentaje',
    subtema: 'Descuentos porcentuales',
    difficulty: 2,
    active: true
  },
  {
    subject: 'M1',
    content: '¿Cuál es el perímetro de un rectángulo de base 8 cm y altura 5 cm?',
    options: {
      a: '13 cm',
      b: '26 cm',
      c: '40 cm',
      d: '52 cm'
    },
    correct_answer: 'b',
    explanation: 'El perímetro de un rectángulo es 2(base + altura) = 2(8 + 5) = 2(13) = 26 cm',
    area_tematica: 'Geometría',
    tema: 'Figuras geométricas',
    subtema: 'Cálculo de perímetros',
    difficulty: 1,
    active: true
  }
];

// M2 Questions
const m2Questions = [
  {
    subject: 'M2',
    content: '¿Cuál es el valor de sen 30°?',
    options: {
      a: '1/4',
      b: '1/3',
      c: '1/2',
      d: '2/3'
    },
    correct_answer: 'c',
    explanation: 'El seno de 30° es igual a 1/2, este es uno de los valores trigonométricos fundamentales',
    area_tematica: 'Geometría',
    tema: 'Razones trigonométricas',
    subtema: 'Valores trigonométricos notables',
    difficulty: 2,
    active: true
  },
  {
    subject: 'M2',
    content: 'En una urna hay 5 bolas rojas y 3 azules. Si se extraen dos bolas sin reposición, ¿cuál es la probabilidad de que ambas sean del mismo color?',
    options: {
      a: '1/4',
      b: '1/3',
      c: '1/2',
      d: '2/3'
    },
    correct_answer: 'c',
    explanation: 'P(RR) = (5/8)(4/7) = 20/56, P(AA) = (3/8)(2/7) = 6/56. P(mismo color) = 26/56 ≈ 1/2',
    area_tematica: 'Probabilidad y Estadística',
    tema: 'Probabilidad condicional',
    subtema: 'Probabilidad sin reposición',
    difficulty: 3,
    active: true
  },
  {
    subject: 'M2',
    content: '¿Cuál es la solución de la ecuación x² - 5x + 6 = 0?',
    options: {
      a: 'x = 2 y x = 3',
      b: 'x = -2 y x = -3',
      c: 'x = 1 y x = 4',
      d: 'x = -1 y x = -4'
    },
    correct_answer: 'a',
    explanation: 'Usando la fórmula cuadrática o factorizando: (x-2)(x-3)=0, por lo tanto x = 2 o x = 3',
    area_tematica: 'Álgebra y Funciones',
    tema: 'Ecuaciones de segundo grado',
    subtema: 'Resolución de ecuaciones cuadráticas',
    difficulty: 2,
    active: true
  }
];

async function insertQuestions() {
  try {
    console.log('Conectando a Supabase...');
    
    // Verificar conexión
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    if (versionError) throw versionError;
    console.log('Conexión exitosa a Supabase');
    
    // Insertar preguntas de M1
    console.log('Insertando preguntas de M1...');
    const { data: m1Data, error: m1Error } = await supabase
      .from('questions')
      .insert(m1Questions)
      .select();

    if (m1Error) {
      throw m1Error;
    }
    console.log(`✓ ${m1Data.length} preguntas de M1 insertadas`);

    // Insertar preguntas de M2
    console.log('Insertando preguntas de M2...');
    const { data: m2Data, error: m2Error } = await supabase
      .from('questions')
      .insert(m2Questions)
      .select();

    if (m2Error) {
      throw m2Error;
    }
    console.log(`✓ ${m2Data.length} preguntas de M2 insertadas`);

    console.log('¡Inserción completada exitosamente!');
    console.log(`Total de preguntas insertadas: ${m1Data.length + m2Data.length}`);

  } catch (error) {
    console.error('Error durante la inserción:', error);
    process.exit(1);
  }
}

// Ejecutar la inserción
insertQuestions();