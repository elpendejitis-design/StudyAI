import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Free-tier model selection
const FREE_TIER_MODEL = 'gemini-3.8-flash';

// Simple in-memory rate limiter to protect Free Tier quotas (15-20 req/min)
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimits = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(req: Request, res: Response, next: () => void) {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'client';
  const now = Date.now();
  let record = rateLimits.get(clientIp);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimits.set(clientIp, record);
    return next();
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      error: `Has superado el límite de ${MAX_REQUESTS_PER_WINDOW} solicitudes por minuto del nivel gratuito. Espera ${retryAfter} segundos o activa el Modo Demostración.`,
      retryAfter,
    });
  }

  record.count++;
  next();
}

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimits.entries()) {
    if (now > record.resetTime) {
      rateLimits.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Health check endpoint
app.get('/api/study/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey && apiKey.trim().length > 0),
    model: FREE_TIER_MODEL,
    rateLimitWindowSeconds: 60,
    rateLimitMax: MAX_REQUESTS_PER_WINDOW,
  });
});

// 1. Text Summarizer Endpoint
app.post('/api/study/summarize', checkRateLimit, async (req: Request, res: Response) => {
  try {
    const { text, level = 'intermedio', focus = 'general', academicLevel = 'universidad' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'Se requiere un texto para resumir.' });
    }

    if (text.length > 15000) {
      return res.status(400).json({
        success: false,
        error: `El texto excede el límite de 15,000 caracteres (${text.length} ingresados). Por favor reduce la longitud para el nivel gratuito.`,
      });
    }

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        code: 'NO_API_KEY',
        error: 'No se detectó GEMINI_API_KEY en el servidor. Puedes utilizar el Modo Demostración para probar todas las funciones sin API.',
      });
    }

    const systemPrompt = `Eres un experto pedagógico y sintetizador de textos académicos en español para la plataforma StudyAI.
Tu objetivo es analizar textos de estudio y producir un resumen altamente estructurado, riguroso pero claro.
Nivel del estudiante: ${academicLevel}.
Nivel de profundidad solicitado: ${level} (sintético = directo a lo esencial, intermedio = balanceado con conceptos clave, detallado = profundo con explicaciones).
Enfoque particular: ${focus}.
Responde EXCLUSIVAMENTE en JSON que cumpla el esquema proporcionado.`;

    const userPrompt = `Analiza, estructura y resume el siguiente texto académico:\n\n${text}`;

    const response = await ai.models.generateContent({
      model: FREE_TIER_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Título conciso e identificativo del tema analizado' },
            executiveSummary: { type: Type.STRING, description: 'Resumen ejecutivo de 2 a 4 párrafos bien estructurados' },
            keyConcepts: {
              type: Type.ARRAY,
              description: 'Glosario de conceptos y términos clave esenciales',
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  importance: { type: Type.STRING, enum: ['alta', 'media', 'baja'] },
                },
                required: ['term', 'definition', 'importance'],
              },
            },
            structuredSections: {
              type: Type.ARRAY,
              description: 'Secciones temáticas ordenadas con puntos clave analíticos',
              items: {
                type: Type.OBJECT,
                properties: {
                  heading: { type: Type.STRING },
                  points: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['heading', 'points'],
              },
            },
            conclusions: {
              type: Type.ARRAY,
              description: 'Conclusiones y aprendizajes fundamentales',
              items: { type: Type.STRING },
            },
            reflectionQuestions: {
              type: Type.ARRAY,
              description: 'Preguntas de reflexión o autoevaluación para afianzar el conocimiento',
              items: { type: Type.STRING },
            },
          },
          required: ['title', 'executiveSummary', 'keyConcepts', 'structuredSections', 'conclusions', 'reflectionQuestions'],
        },
      },
    });

    const outputText = response.text || '{}';
    const parsedData = JSON.parse(outputText);

    res.json({
      success: true,
      data: {
        ...parsedData,
        id: `summary-${Date.now()}`,
        timestamp: Date.now(),
        level,
        sourceLength: text.length,
        originalTextSnippet: text.slice(0, 150) + (text.length > 150 ? '...' : ''),
      },
    });
  } catch (error: any) {
    console.error('Error in /api/study/summarize:', error);
    const isQuota = error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('429');
    res.status(isQuota ? 429 : 500).json({
      success: false,
      code: isQuota ? 'RESOURCE_EXHAUSTED' : 'GENERATION_ERROR',
      error: isQuota
        ? 'Cuota de Gemini temporalmente alcanzada en el nivel gratuito. Activa el Modo Demostración para continuar aprendiendo sin pausas.'
        : `Error al generar el resumen: ${error?.message || 'Error desconocido'}`,
    });
  }
});

// 2. Step-by-Step AI Tutor Endpoint
app.post('/api/study/tutor', checkRateLimit, async (req: Request, res: Response) => {
  try {
    const { messages, mode = 'paso-a-paso', subject = 'General', academicLevel = 'universidad' } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Se requiere un historial de mensajes válido.' });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || typeof lastMessage.content !== 'string' || !lastMessage.content.trim()) {
      return res.status(400).json({ success: false, error: 'El mensaje del usuario no puede estar vacío.' });
    }

    if (lastMessage.content.length > 3000) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje no debe superar los 3,000 caracteres en el nivel gratuito.',
      });
    }

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        code: 'NO_API_KEY',
        error: 'No se detectó GEMINI_API_KEY en el servidor. Puedes utilizar el Modo Demostración para probar todas las funciones sin API.',
      });
    }

    let pedagogyInstruction = '';
    if (mode === 'socratico') {
      pedagogyInstruction = `MÉTODO SOCRÁTICO: No des la respuesta final de golpe. Guía al estudiante haciéndole preguntas reflexivas, invitándolo a razonar el siguiente paso lógico y validando sus intuiciones previas.`;
    } else if (mode === 'analogia') {
      pedagogyInstruction = `MODO ANALOGÍA: Utiliza metáforas vívidas, ejemplos cotidianos y comparaciones intuitivas del mundo real para que el concepto abstracto sea comprensible de inmediato.`;
    } else if (mode === 'ejercicio') {
      pedagogyInstruction = `RESOLUCIÓN GUIADA: Desglosa el problema en: 1) Datos conocidos e incógnita, 2) Fórmula o teoría aplicable, 3) Desarrollo paso a paso justificado, 4) Verificación del resultado y error común a evitar.`;
    } else {
      pedagogyInstruction = `EXPLICACIÓN PASO A PASO: Estructura la respuesta con encabezados claros:
- Introducción intuitiva
- Paso 1, Paso 2, Paso 3 bien delimitados
- Ejemplo práctico aplicado
- Resumen clave para recordar`;
    }

    const systemPrompt = `Eres el Tutor IA de StudyAI, un mentor académico paciente, motivador, riguroso y didáctico en español.
Nivel del estudiante: ${academicLevel}.
Materia: ${subject}.
Enfoque pedagógico: ${pedagogyInstruction}
Siempre alienta al estudiante y mantén un tono positivo y cercano pero académico.
Devuelve un JSON con:
- responseMarkdown: Explicación completa en Markdown con buen uso de negritas, listas y bloques de código o fórmulas.
- suggestedFollowUps: Array con 3 preguntas breves y atractivas de seguimiento que el alumno podría hacer a continuación.`;

    // Format chat history (limit to last 6 messages to stay within free tier budget)
    const recentMessages = messages.slice(-6).map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: FREE_TIER_MODEL,
      contents: recentMessages,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            responseMarkdown: { type: Type.STRING, description: 'La respuesta pedagógica del tutor en formato Markdown' },
            suggestedFollowUps: {
              type: Type.ARRAY,
              description: 'Tres preguntas breves sugeridas para continuar la conversación',
              items: { type: Type.STRING },
            },
          },
          required: ['responseMarkdown', 'suggestedFollowUps'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      data: {
        id: `tutor-${Date.now()}`,
        role: 'model',
        content: parsed.responseMarkdown || 'No se pudo generar la respuesta.',
        suggestedFollowUps: parsed.suggestedFollowUps || [],
        timestamp: Date.now(),
        mode,
        subject,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/study/tutor:', error);
    const isQuota = error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('429');
    res.status(isQuota ? 429 : 500).json({
      success: false,
      code: isQuota ? 'RESOURCE_EXHAUSTED' : 'GENERATION_ERROR',
      error: isQuota
        ? 'Cuota de Gemini temporalmente alcanzada en el nivel gratuito. Activa el Modo Demostración para continuar aprendiendo sin pausas.'
        : `Error en la respuesta del tutor: ${error?.message || 'Error desconocido'}`,
    });
  }
});

// 3. Quiz Generator Endpoint
app.post('/api/study/quiz', checkRateLimit, async (req: Request, res: Response) => {
  try {
    const { topic, textContext, questionCount = 4, difficulty = 'medio', academicLevel = 'universidad' } = req.body;

    if (!topic && !textContext) {
      return res.status(400).json({ success: false, error: 'Se requiere indicar un tema o texto de referencia.' });
    }

    const safeCount = Math.min(Math.max(Number(questionCount) || 4, 2), 8);

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        code: 'NO_API_KEY',
        error: 'No se detectó GEMINI_API_KEY en el servidor. Puedes utilizar el Modo Demostración para probar todas las funciones sin API.',
      });
    }

    const prompt = `Genera un examen tipo test de opción múltiple con ${safeCount} preguntas sobre:
Tema: "${topic || 'Texto de estudio'}".
Nivel de dificultad: ${difficulty}.
Nivel académico: ${academicLevel}.
${textContext ? `Basado en este texto específico:\n"${textContext.slice(0, 5000)}"` : ''}

Requisitos estrictos para cada pregunta:
- Exactamente 4 opciones (índices 0, 1, 2, 3).
- Solo 1 opción correcta (correctAnswerIndex debe ser el número entre 0 y 3 correspondiente a la opción acertada).
- Explicación didáctica completa explicando por qué esa opción es la correcta y qué conceptos aclara.
- Concepto o subtema clave evaluado.`;

    const response = await ai.models.generateContent({
      model: FREE_TIER_MODEL,
      contents: prompt,
      config: {
        systemInstruction: 'Eres un examinador universitario pedagógico en español. Genera pruebas rigurosas, sin ambigüedades y con explicaciones educativas exhaustivas.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Cuatro opciones de respuesta',
                  },
                  correctAnswerIndex: { type: Type.INTEGER, description: 'Índice de 0 a 3 de la respuesta correcta' },
                  explanation: { type: Type.STRING, description: 'Explicación detallada de la respuesta correcta y descartes' },
                  concept: { type: Type.STRING, description: 'Tema o concepto puntual evaluado' },
                },
                required: ['question', 'options', 'correctAnswerIndex', 'explanation', 'concept'],
              },
            },
          },
          required: ['topic', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const questionsWithIds = (parsed.questions || []).map((q: any, idx: number) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${idx}`,
    }));

    res.json({
      success: true,
      data: {
        id: `exam-${Date.now()}`,
        topic: parsed.topic || topic,
        difficulty,
        questions: questionsWithIds,
        createdAt: Date.now(),
      },
    });
  } catch (error: any) {
    console.error('Error in /api/study/quiz:', error);
    const isQuota = error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('429');
    res.status(isQuota ? 429 : 500).json({
      success: false,
      code: isQuota ? 'RESOURCE_EXHAUSTED' : 'GENERATION_ERROR',
      error: isQuota
        ? 'Cuota de Gemini temporalmente alcanzada en el nivel gratuito. Activa el Modo Demostración para continuar aprendiendo sin pausas.'
        : `Error al generar el examen: ${error?.message || 'Error desconocido'}`,
    });
  }
});

// 4. Flashcards Generator Endpoint
app.post('/api/study/flashcards', checkRateLimit, async (req: Request, res: Response) => {
  try {
    const { topic, textContext, count = 5, academicLevel = 'universidad' } = req.body;

    if (!topic && !textContext) {
      return res.status(400).json({ success: false, error: 'Se requiere indicar un tema o texto de estudio.' });
    }

    const safeCount = Math.min(Math.max(Number(count) || 5, 3), 10);

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        code: 'NO_API_KEY',
        error: 'No se detectó GEMINI_API_KEY en el servidor. Puedes utilizar el Modo Demostración para probar todas las funciones sin API.',
      });
    }

    const prompt = `Crea un mazo de ${safeCount} flashcards didácticas para memorización y repaso activo sobre:
Tema: "${topic || 'Conceptos clave'}".
Nivel: ${academicLevel}.
${textContext ? `A partir del siguiente texto:\n"${textContext.slice(0, 4000)}"` : ''}

Requisitos para cada flashcard:
- front: Pregunta estimulante, concepto o reto de memoria activo.
- back: Respuesta concisa, clara y fundamentada.
- hint: Pista nemotécnica o analogía para facilitar el recuerdo.
- tag: Categoría o concepto específico.`;

    const response = await ai.models.generateContent({
      model: FREE_TIER_MODEL,
      contents: prompt,
      config: {
        systemInstruction: 'Eres un diseñador de técnicas de estudio y repetición espaciada en español. Genera flashcards concisas, de alto impacto y pedagógicamente efectivas.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deckTitle: { type: Type.STRING },
            category: { type: Type.STRING },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  tag: { type: Type.STRING },
                },
                required: ['front', 'back'],
              },
            },
          },
          required: ['deckTitle', 'cards'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const cardsWithIds = (parsed.cards || []).map((c: any, idx: number) => ({
      ...c,
      id: `card-${Date.now()}-${idx}`,
      status: 'nuevo',
    }));

    res.json({
      success: true,
      data: {
        id: `deck-${Date.now()}`,
        title: parsed.deckTitle || topic || 'Nuevo Mazo de Estudio',
        description: `Mazo generado automáticamente con ${cardsWithIds.length} tarjetas de repaso activo.`,
        category: parsed.category || 'General',
        cards: cardsWithIds,
        createdAt: Date.now(),
      },
    });
  } catch (error: any) {
    console.error('Error in /api/study/flashcards:', error);
    const isQuota = error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('429');
    res.status(isQuota ? 429 : 500).json({
      success: false,
      code: isQuota ? 'RESOURCE_EXHAUSTED' : 'GENERATION_ERROR',
      error: isQuota
        ? 'Cuota de Gemini temporalmente alcanzada en el nivel gratuito. Activa el Modo Demostración para continuar aprendiendo sin pausas.'
        : `Error al generar flashcards: ${error?.message || 'Error desconocido'}`,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[StudyAI] Servidor educativo corriendo en http://0.0.0.0:${PORT}`);
    console.log(`[StudyAI] Gemini API Key disponible: ${Boolean(apiKey)}`);
  });
}

startServer().catch((err) => {
  console.error('[StudyAI] Error al iniciar el servidor:', err);
});
