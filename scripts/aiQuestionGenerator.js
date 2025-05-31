import fs from 'fs/promises';

// Configuración para diferentes modelos de IA
const AI_CONFIGS = {
  ollama: {
    endpoint: 'http://localhost:11434/api/generate',
    model: 'llama3.1:8b', // o 'gemma2:9b', 'qwen2.5:7b'
    enabled: true
  },
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    enabled: false // Requiere API key
  },
  anthropic: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-haiku-20240307',
    enabled: false // Requiere API key
  }
};

export class AIQuestionGenerator {
  constructor(provider = 'ollama') {
    this.provider = provider;
    this.config = AI_CONFIGS[provider];
    this.questionsGenerated = 0;
    this.questionsRejected = 0;
  }

  async testConnection() {
    console.log(`🔌 Probando conexión con ${this.provider}...`);
    
    try {
      if (this.provider === 'ollama') {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
          const models = await response.json();
          console.log(`✅ Ollama conectado. Modelos disponibles:`, models.models?.map(m => m.name).slice(0, 3));
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.log(`❌ Error conectando con ${this.provider}:`, error.message);
      console.log(`💡 Para usar Ollama:\n   1. Instalar: curl -fsSL https://ollama.ai/install.sh | sh\n   2. Ejecutar: ollama pull llama3.1:8b\n   3. Correr: ollama serve`);
      return false;
    }
  }

  async generateQuestion(prompt, subject, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`    🤖 Generando pregunta (intento ${attempt}/${retries})...`);
        
        const response = await this.callAI(prompt);
        const question = this.parseResponse(response, subject);
        
        if (question && this.validateAIQuestion(question)) {
          this.questionsGenerated++;
          return question;
        } else {
          console.log(`    ⚠️ Pregunta inválida en intento ${attempt}`);
        }
      } catch (error) {
        console.log(`    ❌ Error en intento ${attempt}:`, error.message);
      }
    }
    
    this.questionsRejected++;
    console.log(`    💔 Falló después de ${retries} intentos`);
    return null;
  }

  async callAI(prompt) {
    switch (this.provider) {
      case 'ollama':
        return await this.callOllama(prompt);
      case 'openai':
        return await this.callOpenAI(prompt);
      case 'anthropic':
        return await this.callAnthropic(prompt);
      default:
        throw new Error(`Proveedor ${this.provider} no soportado`);
    }
  }

  async callOllama(prompt) {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        prompt: this.enhancePrompt(prompt),
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  }

  async callOpenAI(prompt) {
    // Requiere OPENAI_API_KEY en variables de entorno
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en crear preguntas PAES de alta calidad para estudiantes chilenos.'
          },
          {
            role: 'user', 
            content: this.enhancePrompt(prompt)
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callAnthropic(prompt) {
    // Requiere ANTHROPIC_API_KEY en variables de entorno
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: this.enhancePrompt(prompt)
        }]
      })
    });

    const data = await response.json();
    return data.content[0].text;
  }

  enhancePrompt(basePrompt) {
    const enhancedPrompt = `
CONTEXTO: Eres un experto en educación chilena especializado en crear preguntas para el examen PAES (Prueba de Acceso a la Educación Superior).

INSTRUCCIONES CRÍTICAS:
1. Crea preguntas de nivel universitario apropiadas para estudiantes de 4° medio
2. Usa terminología y contextos chilenos cuando sea relevante
3. Las preguntas deben ser desafiantes pero justas
4. Evita errores conceptuales o información incorrecta
5. Responde ÚNICAMENTE con el JSON solicitado, sin texto adicional

CALIDAD REQUERIDA:
- Nivel de dificultad similar a exámenes PAES reales
- 4 alternativas plausibles con solo 1 correcta
- Explicación clara y educativa
- Contenido actualizado y relevante

${basePrompt}

IMPORTANTE: Responde SOLO con el JSON válido, sin markdown ni texto extra.`;

    return enhancedPrompt;
  }

  parseResponse(response, subject) {
    try {
      // Limpiar la respuesta para extraer solo el JSON
      let jsonStr = response.trim();
      
      // Remover markdown si existe
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Encontrar el JSON en la respuesta
      const jsonStart = jsonStr.indexOf('{');
      const jsonEnd = jsonStr.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No se encontró JSON válido en la respuesta');
      }
      
      jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
      
      const question = JSON.parse(jsonStr);
      
      // Validar estructura básica
      if (!question.content || !question.options || !question.correct_answer) {
        throw new Error('JSON incompleto: faltan campos requeridos');
      }

      // Asegurar que subject esté configurado
      question.subject = subject;
      
      return question;
    } catch (error) {
      console.log(`    ⚠️ Error parseando respuesta:`, error.message);
      console.log(`    📝 Respuesta recibida:`, response.substring(0, 200) + '...');
      return null;
    }
  }

  validateAIQuestion(question) {
    // Validaciones básicas
    if (!question.content || question.content.length < 50) {
      return false;
    }

    if (!question.options || Object.keys(question.options).length !== 4) {
      return false;
    }

    if (!['a', 'b', 'c', 'd'].includes(question.correct_answer?.toLowerCase())) {
      return false;
    }

    // Validar que las opciones no estén vacías
    for (const [key, value] of Object.entries(question.options)) {
      if (!value || value.trim().length < 2) {
        return false;
      }
    }

    return true;
  }

  async generateBatch(prompts, subject, batchSize = 5) {
    console.log(`\n🔄 Generando lote de ${prompts.length} preguntas para ${subject}...`);
    
    const questions = [];
    
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      console.log(`  📦 Lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(prompts.length/batchSize)}`);
      
      const batchPromises = batch.map(prompt => 
        this.generateQuestion(prompt, subject)
      );
      
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(question => {
        if (question) {
          questions.push(question);
        }
      });
      
      // Pequeño delay entre lotes para no sobrecargar la API
      if (i + batchSize < prompts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`  ✅ Generadas ${questions.length}/${prompts.length} preguntas válidas`);
    return questions;
  }

  getStats() {
    return {
      generated: this.questionsGenerated,
      rejected: this.questionsRejected,
      successRate: this.questionsGenerated / (this.questionsGenerated + this.questionsRejected) * 100
    };
  }
}

// Función de prueba
export async function testAIGeneration() {
  console.log('🧪 Probando generación de preguntas con IA...\n');
  
  const generator = new AIQuestionGenerator('ollama');
  
  // Probar conexión
  const connected = await generator.testConnection();
  if (!connected) {
    console.log('❌ No se puede conectar con el modelo de IA');
    return false;
  }

  // Probar generación de una pregunta simple
  const testPrompt = `
Crea una pregunta de Matemática 1 nivel PAES sobre "Números - Operaciones básicas".

Genera en formato JSON:
{
  "content": "Una pregunta sobre operaciones con números enteros...",
  "options": {"a": "opción 1", "b": "opción 2", "c": "opción 3", "d": "opción 4"},
  "correct_answer": "a",
  "explanation": "Explicación detallada...",
  "area_tematica": "Números",
  "tema": "Operaciones básicas",
  "difficulty": 3
}`;

  const question = await generator.generateQuestion(testPrompt, 'M1');
  
  if (question) {
    console.log('✅ Pregunta de prueba generada exitosamente:');
    console.log(JSON.stringify(question, null, 2));
    return true;
  } else {
    console.log('❌ Falló la generación de pregunta de prueba');
    return false;
  }
}

// Ejecutar prueba si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testAIGeneration();
}