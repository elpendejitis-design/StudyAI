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

  const { messages, mode = 'paso-a-paso', subject = 'General', academicLevel = 'universidad', model } = body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonResponse({ success: false, error: 'Se requiere un historial de mensajes válido.' }, 400);
  }

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || typeof lastMessage.content !== 'string' || !lastMessage.content.trim()) {
    return jsonResponse({ success: false, error: 'El mensaje del usuario no puede estar vacío.' }, 400);
  }

  if (lastMessage.content.length > 3000) {
    return jsonResponse(
      {
        success: false,
        error: 'El mensaje no debe superar los 3,000 caracteres en el nivel gratuito.',
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

    const recentMessages = messages.slice(-6).map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const { response, usedModel } = await generateContentWithRetry(
      ai,
      {
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
      },
      { preferredModel: model, maxRetries: 2, timeoutMs: 25000 }
    );

    const parsed = JSON.parse(response.text || '{}');
    return jsonResponse({
      success: true,
      data: {
        id: `tutor-${Date.now()}`,
        role: 'model',
        content: parsed.responseMarkdown || 'No se pudo generar la respuesta.',
        suggestedFollowUps: parsed.suggestedFollowUps || [],
        timestamp: Date.now(),
        mode,
        subject,
        usedModel,
      },
    });
  } catch (error: any) {
    const err = handleGeminiError(error);
    return jsonResponse(err.body, err.status);
  }
};
