# 🚀 Guía de Deployment - TuPAES.cl

## 📋 Pasos para Montar en tupaes.cl

### **Método 1: Vercel (Recomendado) ⭐**

#### **1. Preparación del Repositorio**
```bash
# 1. Inicializar Git (si no lo tienes)
git init
git add .
git commit -m "Initial commit - TuPAES application"

# 2. Crear repositorio en GitHub
# Ve a github.com y crea un nuevo repositorio llamado "tupaes-app"

# 3. Conectar con GitHub
git remote add origin https://github.com/tu-usuario/tupaes-app.git
git branch -M main
git push -u origin main
```

#### **2. Deploy en Vercel**
1. **Ir a [vercel.com](https://vercel.com)**
2. **Conectar con GitHub** y autorizar
3. **Importar proyecto** "tupaes-app"
4. **Configurar variables de entorno:**
   - `VITE_SUPABASE_URL`: `https://uxooaulemfxisbjkaxjk.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `tu-anon-key`
5. **Deploy automático** ✅

#### **3. Configurar Dominio Personalizado**
1. **En dashboard de Vercel** → Settings → Domains
2. **Agregar dominio:** `tupaes.cl` y `www.tupaes.cl`
3. **Configurar DNS** en tu proveedor de dominio:
   ```
   Type: A
   Name: @
   Value: 76.76.19.61
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. **SSL automático** se configurará solo ✅

---

### **Método 2: Netlify**

#### **1. Deploy Manual**
```bash
# 1. Build de producción
npm run build

# 2. Subir a Netlify
# - Ir a netlify.com
# - Arrastrar carpeta 'dist' al dashboard
# - Configurar dominio personalizado
```

#### **2. Deploy Automático**
1. **Conectar repositorio GitHub**
2. **Configurar build:** 
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Variables de entorno** en Site Settings
4. **Dominio personalizado** en Domain Settings

---

### **Método 3: Hosting Tradicional (cPanel/FTP)**

#### **Si tu hosting actual soporta sitios estáticos:**

```bash
# 1. Build optimizado
npm run build

# 2. Subir contenido de 'dist/' vía FTP
# - Conectar a tu hosting via FTP
# - Subir todo el contenido de la carpeta 'dist'
# - Configurar redirects para SPA (Single Page App)
```

#### **Configuración .htaccess (para Apache):**
```apache
RewriteEngine On
RewriteBase /

# Handle Angular and Vue.js routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache estático
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

---

## 🔧 Configuración de Producción

### **1. Variables de Entorno**
```bash
# Variables requeridas en producción:
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima

# Opcional - para analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

### **2. Optimizaciones de Performance**
```bash
# Build optimizado ya incluye:
✅ Minificación automática
✅ Tree shaking
✅ Code splitting
✅ Asset optimization
✅ Gzip compression
```

### **3. Configuración de Supabase para Producción**

#### **Opción A: Usar proyecto actual**
- ✅ Ya configurado y funcionando
- ✅ Datos existentes preservados
- ⚠️ Compartido con desarrollo

#### **Opción B: Proyecto dedicado (Recomendado)**
1. **Crear nuevo proyecto** en supabase.com
2. **Migrar esquema** usando las migraciones en `/supabase/migrations/`
3. **Importar datos** de preguntas
4. **Actualizar variables** de entorno

---

## 📊 Checklist de Deployment

### **Pre-Deploy**
- [ ] ✅ Build funciona localmente (`npm run build`)
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Supabase en modo producción
- [ ] ✅ Dominio DNS configurado
- [ ] ✅ SSL certificado válido

### **Post-Deploy**
- [ ] ✅ Sitio carga en `https://tupaes.cl`
- [ ] ✅ Login/registro funciona
- [ ] ✅ Preguntas cargan correctamente
- [ ] ✅ Todos los modos funcionan
- [ ] ✅ Datos se guardan en Supabase
- [ ] ✅ Performance optimizada
- [ ] ✅ Compatible con móviles

---

## 🎯 URLs Finales

### **Producción:**
- **Principal:** `https://tupaes.cl`
- **WWW:** `https://www.tupaes.cl`
- **Admin:** `https://tupaes.cl/admin` (futuro)

### **Desarrollo:**
- **Local:** `http://localhost:5173`
- **Staging:** `https://staging-tupaes.vercel.app` (opcional)

---

## 🚨 Consideraciones Importantes

### **1. Base de Datos**
- **1,201 preguntas** listas para producción
- **Fallback automático** a datos locales si Supabase falla
- **Backup regular** de datos de usuarios

### **2. Escalabilidad**
- **CDN automático** con Vercel/Netlify
- **Cache optimizado** para archivos estáticos
- **Compresión Gzip** automática

### **3. Seguridad**
- **HTTPS obligatorio** ✅
- **Headers de seguridad** configurados
- **Rate limiting** en Supabase

### **4. Monitoreo**
- **Analytics** (Google Analytics opcional)
- **Error tracking** (Sentry opcional)
- **Performance monitoring** integrado

---

## 🎉 ¡Listo para Producción!

La aplicación TuPAES está completamente preparada para deployment en `tupaes.cl` con:

- ✅ **1,201 preguntas reales** PAES 2019-2024
- ✅ **Sistema completo** de autenticación
- ✅ **Seguimiento de progreso** detallado
- ✅ **Interfaz optimizada** para estudiantes
- ✅ **Performance de producción**
- ✅ **Escalabilidad automática**

**Tiempo estimado de deployment: 15-30 minutos** ⚡