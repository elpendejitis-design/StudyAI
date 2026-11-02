import { Type } from '@google/genai';
import { PagesFunction, Env } from '../../types';
import { getGeminiClient, FREE_TIER_MODEL, handleGeminiError } from '../../utils/geminiEdge';
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

  const { topic, textContext, count = 5, academicLevel = 'universidad' } = body || {};

  if (!topic && !textContext) {
    return jsonResponse({ success: false, error: 'Se requiere indicar un tema o texto de estudio.' }, 400);
  }

  const safeCount = Math.min(Math.max(Number(count) || 5, 3), 10);

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
        systemInstruction:
          'Eres un diseñador de técnicas de estudio y repetición espaciada en español. Genera flashcards concisas, de alto impacto y pedagógicamente efectivas.',
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

    return jsonResponse({
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
    const err = handleGeminiError(error);
    return jsonResponse(err.body, err.status);
  }
};
