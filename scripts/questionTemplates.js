// Templates de prompts para generar preguntas sintéticas PAES
// Basados en el análisis de patrones de preguntas reales

export const QUESTION_TEMPLATES = {
  
  // MATEMÁTICA 1 - Promedio: 218 caracteres
  M1: {
    subjects: ['Números', 'Álgebra y Funciones', 'Geometría', 'Probabilidad y Estadística'],
    templates: [
      {
        type: 'calculation',
        prompt: `Crea una pregunta de Matemática 1 nivel PAES sobre {area_tematica} - {tema}.

PATRÓN A SEGUIR:
- Longitud: 200-250 caracteres
- Incluir cálculo numérico específico
- Usar palabras clave: {keywords}
- Formato: "¿Cuál es el valor de..." o "Determina..."

EJEMPLO DE ESTILO PAES:
"Si f(x) = 2x + 3, ¿cuál es el valor de f(5)?"

REQUISITOS:
- 4 alternativas numéricas diferentes
- Una respuesta claramente correcta
- Distractores lógicos pero incorrectos
- Explicación matemática clara

Genera SOLO la pregunta en formato JSON:
{
  "content": "...",
  "options": {"a": "...", "b": "...", "c": "...", "d": "..."},
  "correct_answer": "a",
  "explanation": "...",
  "area_tematica": "{area_tematica}",
  "tema": "{tema}",
  "difficulty": 3
}`
      },
      {
        type: 'word_problem',
        prompt: `Crea una pregunta de Matemática 1 nivel PAES sobre {area_tematica} - {tema}.

PATRÓN A SEGUIR:
- Longitud: 200-250 caracteres
- Problema contextualizado (vida real)
- Usar palabras clave: {keywords}
- Formato: "Una persona...", "En una tienda...", "Un terreno..."

EJEMPLO DE ESTILO PAES:
"Un terreno rectangular tiene un perímetro de 120 metros. Si el ancho es 20 metros, ¿cuál es la longitud?"

REQUISITOS:
- Contexto realista chileno
- 4 alternativas con unidades
- Cálculo directo pero no trivial
- Explicación paso a paso

Genera SOLO la pregunta en formato JSON:
{
  "content": "...",
  "options": {"a": "...", "b": "...", "c": "...", "d": "..."},
  "correct_answer": "a", 
  "explanation": "...",
  "area_tematica": "{area_tematica}",
  "tema": "{tema}",
  "difficulty": 3
}`
      }
    ]
  },

  // MATEMÁTICA 2 - Promedio: 224 caracteres
  M2: {
    subjects: ['Números', 'Álgebra y Funciones', 'Geometría', 'Probabilidad y Estadística'],
    templates: [
      {
        type: 'advanced_calculation',
        prompt: `Crea una pregunta de Matemática 2 nivel PAES sobre {area_tematica} - {tema}.

PATRÓN A SEGUIR:
- Longitud: 220-280 caracteres
- Conceptos avanzados (logaritmos, trigonometría, etc.)
- Usar palabras clave: {keywords}
- Formato: "Determina el valor de..." o "Calcula..."

EJEMPLO DE ESTILO PAES:
"Si log₂(x) = 3, ¿cuál es el valor de x?"

REQUISITOS:
- Matemática de 4° medio
- 4 alternativas numéricas
- Requiere conocimiento específico
- Explicación detallada

Genera SOLO la pregunta en formato JSON:
{
  "content": "...",
  "options": {"a": "...", "b": "...", "c": "...", "d": "..."},
  "correct_answer": "a",
  "explanation": "...",
  "area_tematica": "{area_tematica}",
  "tema": "{tema}",
  "difficulty": 4
}`
      }
    ]
  },

  // LENGUAJE - Promedio: 90 caracteres + contexto de lectura
  L: {
    subjects: ['Comprensión Lectora'],
    templates: [
      {
        type: 'reading_comprehension',
        prompt: `Crea una pregunta de Lenguaje nivel PAES con contexto de lectura.

PATRÓN A SEGUIR:
- Pregunta: 80-120 caracteres
- Contexto de lectura: 800-1200 caracteres
- Usar palabras clave: {keywords}
- Formato: "¿Cuál es la idea central...?", "¿Qué propósito...?"

TIPOS DE TEXTO:
- Narrativo (cuento, novela)
- Expositivo (artículo, ensayo)
- Argumentativo (columna, editorial)

REQUISITOS:
- Texto original y relevante
- 4 alternativas de interpretación
- Una respuesta claramente correcta
- Enfoque en comprensión lectora

Genera en formato JSON:
{
  "content": "...",
  "options": {"a": "...", "b": "...", "c": "...", "d": "..."},
  "correct_answer": "a",
  "explanation": "...",
  "area_tematica": "Comprensión Lectora",
  "tema": "{tema}",
  "reading_context": {
    "titulo": "...",
    "texto": "...",
    "numero_lectura": 1
  },
  "difficulty": 3
}`
      }
    ]
  },

  // CIENCIAS BIOLOGÍA - Promedio: 348 caracteres
  CB: {
    subjects: ['Organización, estructura y actividad celular', 'Procesos y funciones biológicas', 'Organismo y ambiente', 'Herencia y evolución'],
    templates: [
      {
        type: 'scientific_analysis',
        prompt: `Crea una pregunta de Ciencias Biología nivel PAES sobre {area_tematica} - {tema}.

PATRÓN A SEGUIR:
- Longitud: 320-380 caracteres
- Contexto experimental/científico
- Usar palabras clave: {keywords}
- Formato: "Un grupo de estudiantes...", "En un experimento...", "Según la investigación..."

EJEMPLO DE ESTILO PAES:
"Un grupo de estudiantes realizó un experimento para determinar el efecto de la luz en la fotosíntesis. Los resultados muestran que..."

REQUISITOS:
- Conceptos de biología actual
- 4 alternativas científicamente válidas
- Basado en evidencia/datos
- Explicación con fundamento científico

Genera SOLO la pregunta en formato JSON:
{
  "content": "...",
  "options": {"a": "...", "b": "...", "c": "...", "d": "..."},
  "correct_answer": "a",
  "explanation": "...",
  "area_tematica": "{area_tematica}",
  "tema": "{tema}",
  "difficulty": 3
}`
      }
    ]
  },

  // CIENCIAS FÍSICA - Promedio: 346 caracteres  
  CF: {
    subjects: ['Ondas', 'Mecánica', 'Energía', 'Electricidad'],
    templates: [
      {
        type: 'physics_problem',
        prompt: `Crea una pregunta de Ciencias Física nivel PAES sobre {area_tematica} - {tema}.

PATRÓN A SEGUIR:
- Longitud: 320-380 caracteres
- Problema físico aplicado
- Usar palabras clave: {keywords}
- Formato: "Un objeto se mueve...", "En un circuito...", "Una onda..."

EJEMPLO DE ESTILO PAES:
"Un objeto de 2 kg se desliza sobre una superficie con fricción. Si la fuerza aplicada es 10 N, ¿cuál es la aceleración?"

REQUISITOS:
- Física de 3° y 4° medio
- 4 alternativas con unidades físicas
- Aplicación de leyes físicas
- Explicación con fórmulas

Genera SOLO la pregunta en formato JSON:
{
  "content": "...",
  "options": {"a": "...", "b": "...", "c": "...", "d": "..."},
  "correct_answer": "a",
  "explanation": "...",
  "area_tematica": "{area_tematica}",
  "tema": "{tema}",
  "difficulty": 3
}`
      }
    ]
  },

  // CIENCIAS QUÍMICA - Promedio: 339 caracteres
  CQ: {
    subjects: ['Estructura atómica', 'Química orgánica', 'Reacciones químicas y estequiometría'],
    templates: [
      {
        type: 'chemistry_problem',
        prompt: `Crea una pregunta de Ciencias Química nivel PAES sobre {area_tematica} - {tema}.

PATRÓN A SEGUIR:
- Longitud: 320-380 caracteres
- Problema químico aplicado
- Usar palabras clave: {keywords}
- Formato: "En una reacción...", "Un compuesto...", "Durante un proceso..."

EJEMPLO DE ESTILO PAES:
"En una reacción de combustión completa del metano (CH₄), ¿cuál es el producto principal además del agua?"

REQUISITOS:
- Química de 3° y 4° medio
- 4 alternativas químicamente correctas
- Uso de fórmulas químicas
- Explicación con principios químicos

Genera SOLO la pregunta en formato JSON:
{
  "content": "...",
  "options": {"a": "...", "b": "...", "c": "...", "d": "..."},
  "correct_answer": "a",
  "explanation": "...",
  "area_tematica": "{area_tematica}",
  "tema": "{tema}",
  "difficulty": 3
}`
      }
    ]
  },

  // HISTORIA - Promedio: 533 caracteres
  H: {
    subjects: ['Historia', 'Sistema Económico', 'Formación Ciudadana'],
    templates: [
      {
        type: 'historical_analysis',
        prompt: `Crea una pregunta de Historia nivel PAES sobre {area_tematica} - {tema}.

PATRÓN A SEGUIR:
- Longitud: 500-580 caracteres
- Contexto histórico detallado
- Formato: "Durante el período...", "En el siglo...", "El proceso de..."

EJEMPLO DE ESTILO PAES:
"Durante el siglo XIX, Chile experimentó importantes transformaciones políticas y sociales. La consolidación del Estado republicano se vio marcada por..."

REQUISITOS:
- Historia de Chile y universal
- 4 alternativas históricamente precisas
- Análisis de procesos históricos
- Explicación con contexto temporal

Genera SOLO la pregunta en formato JSON:
{
  "content": "...",
  "options": {"a": "...", "b": "...", "c": "...", "d": "..."},
  "correct_answer": "a",
  "explanation": "...",
  "area_tematica": "{area_tematica}",
  "tema": "{tema}",
  "difficulty": 3
}`
      }
    ]
  }
};

export const QUALITY_CRITERIA = {
  // Criterios de validación para cada materia
  M1: {
    minLength: 150,
    maxLength: 300,
    requiredElements: ['numbers', 'calculation'],
    forbiddenWords: ['obvio', 'fácil', 'simple']
  },
  M2: {
    minLength: 180,
    maxLength: 320,
    requiredElements: ['advanced_math', 'formulas'],
    forbiddenWords: ['obvio', 'fácil', 'simple']
  },
  L: {
    minLength: 60,
    maxLength: 150,
    requiredElements: ['reading_reference'],
    forbiddenWords: ['trivial', 'obvio']
  },
  CB: {
    minLength: 250,
    maxLength: 450,
    requiredElements: ['scientific_terms', 'biological_process'],
    forbiddenWords: ['siempre', 'nunca', 'imposible']
  },
  CF: {
    minLength: 250,
    maxLength: 450,
    requiredElements: ['physics_terms', 'units'],
    forbiddenWords: ['siempre', 'nunca', 'imposible']
  },
  CQ: {
    minLength: 250,
    maxLength: 450,
    requiredElements: ['chemical_terms', 'formulas'],
    forbiddenWords: ['siempre', 'nunca', 'imposible']
  },
  H: {
    minLength: 400,
    maxLength: 650,
    requiredElements: ['historical_context', 'temporal_reference'],
    forbiddenWords: ['siempre', 'nunca', 'todos los']
  }
};