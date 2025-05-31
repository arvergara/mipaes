import fs from 'fs/promises';
import path from 'path';

async function testAppSetup() {
  console.log('🧪 Verificando configuración de la aplicación PAES...\n');
  
  let allGood = true;
  
  // 1. Verificar que el archivo de preguntas existe
  try {
    const questionsPath = 'public/consolidated_questions.json';
    const questionsFile = await fs.readFile(questionsPath, 'utf-8');
    const questions = JSON.parse(questionsFile);
    
    console.log('✅ Archivo de preguntas encontrado');
    console.log(`   📊 Total preguntas: ${questions.length}`);
    
    // Contar por materia
    const bySubject = {};
    questions.forEach(q => {
      bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
    });
    
    console.log('   📚 Distribución por materia:');
    Object.entries(bySubject).forEach(([subject, count]) => {
      console.log(`      ${subject}: ${count} preguntas`);
    });
    
    // Verificar estructuras especiales
    const languageQuestions = questions.filter(q => q.subject === 'L' && q.reading_context);
    console.log(`   📖 Preguntas de Lenguaje con lectura: ${languageQuestions.length}`);
    
    const scienceWithImages = questions.filter(q => 
      ['CB', 'CF', 'CQ'].includes(q.subject) && q.has_images
    );
    console.log(`   🔬 Preguntas de Ciencias con imágenes: ${scienceWithImages.length}`);
    
  } catch (error) {
    console.log('❌ Error al cargar preguntas:', error.message);
    allGood = false;
  }
  
  // 2. Verificar variables de entorno
  try {
    const envFile = await fs.readFile('.env', 'utf-8');
    const hasSupabaseUrl = envFile.includes('VITE_SUPABASE_URL');
    const hasSupabaseKey = envFile.includes('VITE_SUPABASE_ANON_KEY');
    
    console.log(`\n🔐 Variables de entorno:`);
    console.log(`   ${hasSupabaseUrl ? '✅' : '❌'} VITE_SUPABASE_URL`);
    console.log(`   ${hasSupabaseKey ? '✅' : '❌'} VITE_SUPABASE_ANON_KEY`);
    
    if (!hasSupabaseUrl || !hasSupabaseKey) {
      console.log('   ⚠️  Supabase no configurado - se usarán datos locales');
    }
  } catch (error) {
    console.log('\n❌ No se pudo leer .env:', error.message);
    console.log('   ⚠️  Se usarán datos locales únicamente');
  }
  
  // 3. Verificar estructura de archivos clave
  const keyFiles = [
    'src/components/QuestionView.tsx',
    'src/components/QuestionStats.tsx',
    'src/lib/questions.ts',
    'src/lib/questionsLocal.ts',
    'src/types/index.ts'
  ];
  
  console.log(`\n📁 Archivos clave:`);
  for (const file of keyFiles) {
    try {
      await fs.access(file);
      console.log(`   ✅ ${file}`);
    } catch {
      console.log(`   ❌ ${file} - FALTANTE`);
      allGood = false;
    }
  }
  
  // 4. Verificar build
  try {
    await fs.access('dist');
    console.log(`\n🏗️  Build:`);
    console.log(`   ✅ Directorio dist existe`);
    
    const distFiles = await fs.readdir('dist');
    const hasIndex = distFiles.includes('index.html');
    const hasAssets = distFiles.includes('assets');
    
    console.log(`   ${hasIndex ? '✅' : '❌'} index.html`);
    console.log(`   ${hasAssets ? '✅' : '❌'} assets/`);
    
  } catch {
    console.log(`\n⚠️  Build no encontrado - ejecutar 'npm run build'`);
  }
  
  // 5. Resumen final
  console.log(`\n${allGood ? '🎉' : '⚠️'} Estado general: ${allGood ? 'TODO LISTO' : 'NECESITA ATENCIÓN'}`);
  
  if (allGood) {
    console.log(`
🚀 ¡La aplicación está lista para probar!

📝 Pasos siguientes:
1. Ejecutar: npm run dev
2. Navegar a: http://localhost:5173/
3. Seguir la guía en TESTING_GUIDE.md
4. Probar el flujo: Login → Materia → Modo → Preguntas

💡 Funcionalidades principales:
• 1,032 preguntas reales PAES 2019-2024
• Sistema de autenticación completo
• Seguimiento de progreso y resultados
• Interfaz diferenciada por tipo de materia
• Dashboard de estadísticas
• Fallback automático a datos locales
`);
  } else {
    console.log(`
⚠️  Algunos componentes necesitan atención.
   Revisar los errores marcados arriba.
   La aplicación puede funcionar parcialmente.
`);
  }
}

// Ejecutar verificación
testAppSetup().catch(console.error);