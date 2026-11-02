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

  const { text, level = 'intermedio', focus = 'general', academicLevel = 'universidad', model } = body || {};

  if (!text || typeof text !== 'string') {
    return jsonResponse({ success: false, error: 'Se requiere un texto para resumir.' }, 400);
  }

  if (text.length > 15000) {
    return jsonResponse(
      {
        success: false,
        error: `El texto excede el límite de 15,000 caracteres (${text.length} ingresados). Por favor reduce la longitud para el nivel gratuito.`,
      },
      400
    );
  }

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
    const systemPrompt = `Eres un experto pedagógico y sintetizador de textos académicos en español para la plataforma StudyAI.
Tu objetivo es analizar textos de estudio y producir un resumen altamente estructurado, riguroso pero claro.
Nivel del estudiante: ${academicLevel}.
Nivel de profundidad solicitado: ${level} (sintético = directo a lo esencial, intermedio = balanceado con conceptos clave, detallado = profundo con explicaciones).
Enfoque particular: ${focus}.
Responde EXCLUSIVAMENTE en JSON que cumpla el esquema proporcionado.`;

    const userPrompt = `Analiza, estructura y resume el siguiente texto académico:\n\n${text}`;

    const { response, usedModel } = await generateContentWithRetry(
      ai,
      {
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
      },
      { preferredModel: model, maxRetries: 2, timeoutMs: 25000 }
    );

    const outputText = response.text || '{}';
    const parsedData = JSON.parse(outputText);

    return jsonResponse({
      success: true,
      data: {
        ...parsedData,
        id: `summary-${Date.now()}`,
        timestamp: Date.now(),
        level,
        usedModel,
        sourceLength: text.length,
        originalTextSnippet: text.slice(0, 150) + (text.length > 150 ? '...' : ''),
      },
    });
  } catch (error: any) {
    const err = handleGeminiError(error);
    return jsonResponse(err.body, err.status);
  }
};
