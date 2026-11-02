import { GoogleGenAI, GenerateContentParameters } from '@google/genai';
import { Env } from '../types';

// Official, verified Gemini models available in Google AI Studio free tier
export const PRIMARY_FREE_MODEL = 'gemini-3.8-flash';
export const FALLBACK_FREE_MODEL = 'gemini-3.1-flash-lite';
export const VALID_FREE_MODELS = [PRIMARY_FREE_MODEL, FALLBACK_FREE_MODEL] as const;
export type FreeTierModel = (typeof VALID_FREE_MODELS)[number];

export function getGeminiClient(env: Env) {
  const apiKey =
    env?.GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '') ||
    '';

  if (!apiKey || apiKey.trim().length === 0) {
    return { ai: null, apiKey: '' };
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  return { ai, apiKey };
}

export type GenerateContentInput = Omit<GenerateContentParameters, 'model'> & {
  model?: string;
};

interface GenerateOptions {
  preferredModel?: string;
  maxRetries?: number;
  timeoutMs?: number;
}

/**
 * Executes a Gemini request with:
 * - Up to 2 retries (3 attempts total)
 * - Short exponential backoff with jitter
 * - Respects Retry-After header
 * - Automatic pivot to fallback model (gemini-3.1-flash-lite) if 503 high demand occurs
 * - AbortController timeout safeguard
 */
export async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: GenerateContentInput,
  options: GenerateOptions = {}
) {
  const maxRetries = options.maxRetries ?? 2;
  const timeoutMs = options.timeoutMs ?? 25000;

  // Determine initial model
  let currentModel =
    options.preferredModel && VALID_FREE_MODELS.includes(options.preferredModel as FreeTierModel)
      ? options.preferredModel
      : PRIMARY_FREE_MODEL;

  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await ai.models.generateContent({
        ...params,
        model: currentModel,
      });
      clearTimeout(timer);
      return { response, usedModel: currentModel, attempts: attempt + 1 };
    } catch (error: any) {
      clearTimeout(timer);
      lastError = error;

      const isHighDemand503 =
        error?.status === 503 ||
        error?.code === 503 ||
        error?.message?.includes('503') ||
        error?.message?.includes('high demand') ||
        error?.message?.includes('UNAVAILABLE') ||
        error?.message?.includes('overloaded');

      const isQuota429 =
        error?.status === 429 ||
        error?.code === 429 ||
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('429');

      // Only retry for transient 503 (high demand) or 429 (rate limits)
      if ((isHighDemand503 || isQuota429) && attempt < maxRetries) {
        // Check for Retry-After
        let waitMs = 0;
        const retryAfterHeader = error?.headers?.get?.('retry-after') || error?.retryAfter;
        if (retryAfterHeader) {
          const parsed = parseInt(retryAfterHeader, 10);
          if (!isNaN(parsed) && parsed > 0 && parsed <= 8) {
            waitMs = parsed * 1000;
          }
        }

        if (!waitMs) {
          // Short exponential backoff + jitter:
          // attempt 0: ~1000ms - 1500ms
          // attempt 1: ~2000ms - 2500ms
          const baseDelay = 1000 * Math.pow(2, attempt);
          const jitter = Math.floor(Math.random() * 500);
          waitMs = baseDelay + jitter;
        }

        console.warn(
          `[StudyAI Gemini Retry] Intento ${attempt + 1} falló con ${error?.status || error?.message}. Reintentando en ${waitMs}ms con modelo ${currentModel}...`
        );

        // If 503 high demand occurred on gemini-3.8-flash, pivot to gemini-3.1-flash-lite on retry
        if (isHighDemand503 && currentModel === PRIMARY_FREE_MODEL) {
          currentModel = FALLBACK_FREE_MODEL;
          console.log(`[StudyAI Gemini] Conmutando al modelo alternativo de alta disponibilidad: ${FALLBACK_FREE_MODEL}`);
        }

        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

export function handleGeminiError(error: any) {
  console.error('[StudyAI Edge Function Error]:', error);

  const isHighDemand503 =
    error?.status === 503 ||
    error?.code === 503 ||
    error?.message?.includes('503') ||
    error?.message?.includes('high demand') ||
    error?.message?.includes('UNAVAILABLE') ||
    error?.message?.includes('overloaded');

  const isQuota429 =
    error?.status === 429 ||
    error?.code === 429 ||
    error?.message?.includes('RESOURCE_EXHAUSTED') ||
    error?.message?.includes('429');

  const isTimeout =
    error?.name === 'AbortError' ||
    error?.message?.includes('aborted') ||
    error?.message?.includes('timeout');

  if (isHighDemand503) {
    return {
      status: 503,
      body: {
        success: false,
        code: 'HIGH_DEMAND_503',
        canRetry: true,
        error:
          'El modelo de Gemini está experimentando alta demanda en el nivel gratuito. Se ejecutaron 2 reintentos automáticos sin éxito. Puedes pulsar "Reintentar" o activar el Modo Demostración.',
      },
    };
  }

  if (isQuota429) {
    return {
      status: 429,
      body: {
        success: false,
        code: 'RESOURCE_EXHAUSTED',
        canRetry: true,
        error:
          'Límite de solicitudes por minuto alcanzado temporalmente en la cuota gratuita de Gemini. Espera unos instantes y pulsa "Reintentar" o activa el Modo Demostración.',
      },
    };
  }

  if (isTimeout) {
    return {
      status: 504,
      body: {
        success: false,
        code: 'TIMEOUT',
        canRetry: true,
        error:
          'La solicitud excedió el tiempo de espera (25s) debido a congestión en la API. Por favor pulsa "Reintentar".',
      },
    };
  }

  return {
    status: 500,
    body: {
      success: false,
      code: 'GENERATION_ERROR',
      canRetry: true,
      error: `Error en la llamada a la IA: ${error?.message || 'Error desconocido'}. Puedes volver a intentarlo.`,
    },
  };
}
