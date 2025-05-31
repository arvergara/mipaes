import { testAIGeneration } from './aiQuestionGenerator.js';

async function runTest() {
  console.log('🧪 Iniciando prueba de generación de IA...\n');
  
  try {
    const result = await testAIGeneration();
    if (result) {
      console.log('\n✅ Prueba exitosa: El sistema de IA está funcionando');
    } else {
      console.log('\n❌ Prueba fallida: Problemas con el sistema de IA');
    }
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

runTest();