import { Type } from '@google/genai';
import { PagesFunction, Env } from '../../types';
import { getGeminiClient, generateContentWithRetry, handleGeminiError } from '../../utils/geminiEdge';
import { checkEdgeRateLimit, createRateLimitResponse, jsonResponse } from '../../utils/rateLimiter';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const rate = checkEdgeRateLimit(context.request);
  if (!rate.allowed) {
    return createRateLimitResponse(rate.retryAfter);
  }

  let body: any;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ success: false, error: 'Cuerpo de solicitud JSON inválido.' }, 400);
  }

  const { topic, textContext, questionCount = 4, difficulty = 'medio', academicLevel = 'universidad', model } = body || {};

  if (!topic && !textContext) {
    return jsonResponse({ success: false, error: 'Se requiere indicar un tema o texto de referencia.' }, 400);
  }

  const safeCount = Math.min(Math.max(Number(questionCount) || 4, 2), 8);

  const { ai, apiKey } = getGeminiClient(context.env);
  if (!ai || !apiKey) {
    return jsonResponse(
      {
        success: false,
        code: 'NO_API_KEY',
        error: 'No se detectó GEMINI_API_KEY en las variables de entorno de Cloudflare Pages. Puedes usar el Modo Demostración.',
      },
      503
    );
  }

  try {
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

    const { response, usedModel } = await generateContentWithRetry(
      ai,
      {
        contents: prompt,
        config: {
          systemInstruction:
            'Eres un examinador universitario pedagógico en español. Genera pruebas rigurosas, sin ambigüedades y con explicaciones educativas exhaustivas.',
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
      },
      { preferredModel: model, maxRetries: 2, timeoutMs: 25000 }
    );

    const parsed = JSON.parse(response.text || '{}');
    const questionsWithIds = (parsed.questions || []).map((q: any, idx: number) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${idx}`,
    }));

    return jsonResponse({
      success: true,
      data: {
        id: `exam-${Date.now()}`,
        topic: parsed.topic || topic,
        difficulty,
        usedModel,
        questions: questionsWithIds,
        createdAt: Date.now(),
      },
    });
  } catch (error: any) {
    const err = handleGeminiError(error);
    return jsonResponse(err.body, err.status);
  }
};
