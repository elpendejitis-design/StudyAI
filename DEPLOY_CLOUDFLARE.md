# Guía de Despliegue de StudyAI en Cloudflare Pages (100% Gratuito)

StudyAI está configurado con **Cloudflare Pages Functions** (arquitectura serverless edge sin necesidad de un servidor Express tradicional).

---

## 🚀 Método 1: Conectar Repositorio GitHub / GitLab (Recomendado)

1. **Sube el código a tu repositorio de GitHub o GitLab**:
   ```bash
   git init
   git add .
   git commit -m "feat: StudyAI para Cloudflare Pages"
   git branch -M main
   git remote add origin <URL-DE-TU-REPOSITORIO>
   git push -u origin main
   ```

2. **Entra al panel de Cloudflare**:
   - Ve a **Cloudflare Dashboard** → **Compute (Workers & Pages)** → **Create application** → **Pages** → **Connect to Git**.
   - Selecciona tu repositorio de StudyAI.

3. **Configuración de compilación**:
   - **Framework preset**: `Vite` (o `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (por defecto)

4. **Variables de entorno secretas (API Key)**:
   - En la sección **Environment variables** (o en **Settings > Environment variables** del proyecto):
     - Variable: `GEMINI_API_KEY`
     - Valor: Tu clave de Google Gemini (nivel gratuito). *Márcala como `Encrypt` / Secreto*.
     - *(Opcional)* Variable: `NODE_VERSION` = `20`

5. **Haz clic en "Save and Deploy"**:
   - Cloudflare compilará el frontend en `dist/` y desplegará automáticamente las funciones Edge en `/functions/api/study/*`.
   - ¡Tu aplicación estará en línea con dominio `.pages.dev` y certificado SSL gratuito inmediato!

---

## ⚡ Método 2: Despliegue Directo con Wrangler CLI

Si prefieres desplegar desde tu terminal:

1. **Instala Wrangler**:
   ```bash
   npm install -g wrangler
   # Inicia sesión en Cloudflare
   wrangler login
   ```

2. **Compila el proyecto**:
   ```bash
   npm run build
   ```

3. **Despliega a Cloudflare Pages**:
   ```bash
   npx wrangler pages deploy dist --project-name studyai
   ```

4. **Configura el secreto en Cloudflare**:
   ```bash
   npx wrangler pages secret put GEMINI_API_KEY --project-name studyai
   ```

---

## 🛡️ Características Edge Implementadas

- **Rutas serverless edge en `functions/api/study/`**:
  - `GET /api/study/health`: Comprobación de estado y disponibilidad de API key.
  - `POST /api/study/summarize`: Resumidor estructurado jerárquico.
  - `POST /api/study/tutor`: Tutor pedagógico paso a paso y socrático.
  - `POST /api/study/quiz`: Generador de exámenes tipo test con retroalimentación.
  - `POST /api/study/flashcards`: Generador de tarjetas de repaso interactivo.
- **Seguridad**: La variable `GEMINI_API_KEY` solo reside en el backend de Cloudflare y nunca viaja al navegador.
- **Ruta de caché `public/_routes.json`**: Todo el tráfico estático (`/assets/*`, etc.) se sirve directo desde la CDN global de Cloudflare sin consumir invocaciones de funciones.
- **Límites y protección de cuota**: Limitador de tasa integrado y gestión del código 429 `RESOURCE_EXHAUSTED` con fallback inmediato al Modo Demostración.
