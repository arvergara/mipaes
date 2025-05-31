# 🧪 Guía de Pruebas - Aplicación PAES

## 📋 Flujo de Prueba Completo

### **1. Acceso a la Aplicación**
- 🌐 Navega a: `http://localhost:5173/`
- ✅ Verifica que la página cargue correctamente
- ✅ Deberías ver las estadísticas de la base de preguntas (1,032 preguntas)

### **2. Registro/Login de Usuario**

#### **Opción A: Crear Nueva Cuenta**
1. **Hacer clic en "Iniciar Sesión"** en el header
2. **Cambiar a "Registrarse"** en el modal
3. **Completar datos:**
   - Email: `estudiante@test.com`
   - Contraseña: `test123456`
   - Nombre: `Juan`
   - Apellido Paterno: `Pérez`
   - Apellido Materno: `González`
   - RUT: `12345678-9`
   - Curso: `4° Medio`
   - Colegio: `Liceo de Prueba`
   - Fecha de Nacimiento: `2006-01-15`
   - Sexo: `Masculino`
   - Teléfono: `+56912345678`

#### **Opción B: Login con Cuenta Existente**
- Email: `estudiante@test.com`
- Contraseña: `test123456`

### **3. Selección de Materia**

#### **Materias Disponibles:**
- **M1** (Matemática 1): 318 preguntas ✅
- **M2** (Matemática 2): 79 preguntas ✅
- **L** (Lenguaje): 269 preguntas ✅
- **CB** (Ciencias Biología): 173 preguntas ✅
- **CF** (Ciencias Física): 144 preguntas ✅
- **CQ** (Ciencias Química): 115 preguntas ✅
- **H** (Historia): 103 preguntas ✅
- **ALL** (Todas las materias): Mix de todas ✅

**Recomendación para prueba:** Comienza con **"L" (Lenguaje)** para ver las lecturas.

### **4. Selección de Modo de Práctica**

#### **Modos Disponibles:**

**🎯 PAES Mode**
- Simulación completa del examen real
- Tiempo límite por sección
- Sin feedback inmediato
- Evaluación final

**📚 Test Mode**
- Feedback inmediato
- Explicaciones después de cada respuesta
- Sin límite de tiempo
- Ideal para aprendizaje

**🔍 Review Mode**
- Revisión de preguntas específicas
- Enfoque en áreas problemáticas
- Análisis detallado

**Recomendación:** Comienza con **"Test Mode"** para ver el feedback inmediato.

### **5. Experiencia de Preguntas**

#### **Qué Verificar:**

**Para Lenguaje (L):**
- ✅ **Contexto de lectura** se muestra arriba de la pregunta
- ✅ **Botón "Ver completa"** para expandir el texto
- ✅ **Título de la lectura** visible
- ✅ **Preguntas relacionadas** a la misma lectura

**Para Ciencias (CB, CF, CQ):**
- ✅ **Indicador de elementos visuales** cuando aplique
- ✅ **Contenido técnico** preservado
- ✅ **Fórmulas y símbolos** legibles

**Para Matemáticas (M1, M2):**
- ✅ **Fórmulas matemáticas** preservadas
- ✅ **Gráficos y diagramas** indicados
- ✅ **Contexto numérico** claro

**Para Historia (H):**
- ✅ **Contexto histórico** presente
- ✅ **Fechas y datos** precisos

### **6. Sistema de Seguimiento**

#### **Qué se Registra Automáticamente:**
- ✅ **Tiempo por pregunta**
- ✅ **Respuesta seleccionada**
- ✅ **Correcta/Incorrecta**
- ✅ **Área temática**
- ✅ **Nivel de dificultad**
- ✅ **Modo de práctica**

#### **Cómo Verificar el Progreso:**
1. **Durante la práctica:** Contador de preguntas correctas
2. **Al finalizar:** Resumen de resultados
3. **Base de datos:** Los datos se guardan en `question_attempts`

### **7. Casos de Prueba Específicos**

#### **Test Case 1: Pregunta de Lenguaje con Lectura**
1. Seleccionar **"L" (Lenguaje)**
2. Modo **"Test Mode"**
3. Verificar que aparezca el contexto de lectura
4. Expandir la lectura completa
5. Responder la pregunta
6. Verificar explicación

#### **Test Case 2: Pregunta de Ciencias**
1. Seleccionar **"CF" (Física)**
2. Modo **"Test Mode"**
3. Buscar pregunta con indicador de elementos visuales
4. Verificar metadatos (área temática, habilidad)
5. Responder y ver feedback

#### **Test Case 3: Sesión Completa**
1. Seleccionar **"M1" (Matemática 1)**
2. Modo **"PAES Mode"**
3. Completar toda la sesión
4. Verificar resumen final
5. Confirmar que se guardó en la base de datos

### **8. Problemas Conocidos y Soluciones**

#### **Si Supabase no está disponible:**
- ✅ **Fallback automático** a datos locales
- ✅ **1,032 preguntas** funcionan sin conexión
- ❌ **No se guarda progreso** (solo en memoria)

#### **Si aparece "No hay preguntas":**
1. Verificar que `consolidated_questions.json` esté en `/public/`
2. Abrir consola del navegador para ver errores
3. Refrescar la página

#### **Si el login falla:**
1. Verificar configuración de Supabase en `.env`
2. Usar modo sin autenticación para probar preguntas
3. Revisar logs de consola

### **9. Datos de Prueba**

#### **Usuarios de Prueba:**
- `estudiante1@test.com` / `password123`
- `estudiante2@test.com` / `password123`
- `profesor@test.com` / `password123`

#### **Sesiones Recomendadas:**
1. **Sesión Corta:** 5 preguntas de una materia
2. **Sesión Media:** 15 preguntas mixtas
3. **Simulación PAES:** 45 preguntas completas

### **10. Validación del Sistema**

#### **Checklist Final:**
- [ ] ✅ Login/Registro funciona
- [ ] ✅ Preguntas cargan correctamente
- [ ] ✅ Diferentes tipos de preguntas se muestran bien
- [ ] ✅ Timer funciona (en modo PAES)
- [ ] ✅ Respuestas se registran
- [ ] ✅ Feedback se muestra (en modo Test)
- [ ] ✅ Progreso se guarda
- [ ] ✅ Estadísticas son precisas
- [ ] ✅ Navegación fluida entre preguntas
- [ ] ✅ Salida y reset funcionan

### **11. Métricas a Observar**

#### **Durante las Pruebas:**
- **Tiempo de carga:** < 3 segundos
- **Preguntas disponibles:** 1,032 total
- **Distribución por materia:** Verificar en dashboard
- **Tasa de éxito:** Respuestas correctas/total
- **Tiempo promedio por pregunta:** 1-3 minutos

---

## 🎯 **Objetivo de la Prueba**

Confirmar que un estudiante puede:
1. **Registrarse/iniciar sesión** sin problemas
2. **Seleccionar una materia** de su interés
3. **Practicar con preguntas reales** del PAES
4. **Recibir feedback** inmediato en modo Test
5. **Ver su progreso** y resultados
6. **Navegar fluidamente** por la aplicación

## 🚀 **¡Listo para Probar!**

La aplicación está configurada con **1,032 preguntas reales** de exámenes PAES 2019-2024, sistema de autenticación completo, y seguimiento detallado del progreso del estudiante.