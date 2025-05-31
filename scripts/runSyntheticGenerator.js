import { SyntheticQuestionGenerator } from './generateSyntheticQuestionsDemo.js';

async function runGenerator() {
  console.log('🎯 GENERADOR DE PREGUNTAS SINTÉTICAS PAES\n');
  
  const generator = new SyntheticQuestionGenerator();
  
  console.log('Inicializando...');
  await generator.initialize();
  
  console.log('Generando preguntas...');
  await generator.generateAllQuestions();
  
  console.log('✅ Completado!');
}

runGenerator().catch(console.error);