import fs from 'fs/promises';

async function analyzeQuestionPatterns() {
  console.log('🔍 Analizando patrones en preguntas PAES reales...\n');
  
  try {
    const questionsFile = await fs.readFile('public/consolidated_questions.json', 'utf-8');
    const questions = JSON.parse(questionsFile);
    
    // Análisis por materia
    const analysis = {};
    
    questions.forEach(q => {
      const subject = q.subject;
      
      if (!analysis[subject]) {
        analysis[subject] = {
          count: 0,
          areas: {},
          questionTypes: [],
          contentPatterns: [],
          optionPatterns: [],
          averageLength: 0,
          totalLength: 0,
          keywords: new Set(),
          readingContext: 0
        };
      }
      
      const subjectData = analysis[subject];
      subjectData.count++;
      
      // Analizar área temática
      if (q.area_tematica) {
        subjectData.areas[q.area_tematica] = (subjectData.areas[q.area_tematica] || 0) + 1;
      }
      
      // Analizar contenido
      if (q.content) {
        subjectData.totalLength += q.content.length;
        
        // Detectar patrones de pregunta
        const content = q.content.toLowerCase();
        
        if (content.includes('¿cuál') || content.includes('cual')) {
          subjectData.questionTypes.push('multiple_choice');
        }
        if (content.includes('¿qué') || content.includes('que')) {
          subjectData.questionTypes.push('what_question');
        }
        if (content.includes('¿cómo') || content.includes('como')) {
          subjectData.questionTypes.push('how_question');
        }
        if (content.includes('¿por qué') || content.includes('por que')) {
          subjectData.questionTypes.push('why_question');
        }
        if (content.includes('según') || content.includes('de acuerdo')) {
          subjectData.questionTypes.push('according_to');
        }
        if (content.includes('gráfico') || content.includes('figura') || content.includes('esquema')) {
          subjectData.questionTypes.push('visual_based');
        }
        
        // Extraer palabras clave por materia
        if (subject === 'M1' || subject === 'M2') {
          const mathKeywords = ['función', 'ecuación', 'gráfico', 'valor', 'variable', 'calcula', 'determina'];
          mathKeywords.forEach(keyword => {
            if (content.includes(keyword)) subjectData.keywords.add(keyword);
          });
        } else if (subject === 'L') {
          const langKeywords = ['texto', 'párrafo', 'autor', 'narrador', 'personaje', 'idea', 'propósito'];
          langKeywords.forEach(keyword => {
            if (content.includes(keyword)) subjectData.keywords.add(keyword);
          });
        } else if (['CB', 'CF', 'CQ'].includes(subject)) {
          const scienceKeywords = ['proceso', 'experimento', 'resultado', 'hipótesis', 'variable', 'análisis'];
          scienceKeywords.forEach(keyword => {
            if (content.includes(keyword)) subjectData.keywords.add(keyword);
          });
        }
      }
      
      // Contexto de lectura
      if (q.reading_context) {
        subjectData.readingContext++;
      }
      
      // Analizar opciones
      if (q.options) {
        const optionCount = Object.keys(q.options).length;
        const optionLengths = Object.values(q.options).map(opt => opt.length);
        subjectData.optionPatterns.push({
          count: optionCount,
          avgLength: optionLengths.reduce((a, b) => a + b, 0) / optionLengths.length
        });
      }
    });
    
    // Calcular promedios
    Object.keys(analysis).forEach(subject => {
      const data = analysis[subject];
      data.averageLength = Math.round(data.totalLength / data.count);
      data.keywords = Array.from(data.keywords);
      
      // Contar tipos de pregunta
      const typeCount = {};
      data.questionTypes.forEach(type => {
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      data.questionTypeFreq = typeCount;
    });
    
    // Guardar análisis
    await fs.writeFile('question_patterns_analysis.json', JSON.stringify(analysis, null, 2));
    
    // Mostrar resumen
    console.log('📊 ANÁLISIS COMPLETADO:\n');
    
    Object.entries(analysis).forEach(([subject, data]) => {
      console.log(`🎯 ${subject} (${data.count} preguntas):`);
      console.log(`   📏 Longitud promedio: ${data.averageLength} caracteres`);
      console.log(`   📚 Áreas principales:`, Object.keys(data.areas).slice(0, 3).join(', '));
      console.log(`   ❓ Tipos de pregunta:`, Object.keys(data.questionTypeFreq).slice(0, 3).join(', '));
      console.log(`   🔑 Palabras clave:`, data.keywords.slice(0, 5).join(', '));
      if (data.readingContext > 0) {
        console.log(`   📖 Con contexto de lectura: ${data.readingContext}`);
      }
      console.log('');
    });
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Error analizando patrones:', error);
  }
}

// Ejecutar análisis
analyzeQuestionPatterns();