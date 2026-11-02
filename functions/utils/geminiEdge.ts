import { GoogleGenAI } from '@google/genai';
import { Env } from '../types';

export const FREE_TIER_MODEL = 'gemini-3.8-flash';

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

export function handleGeminiError(error: any) {
  console.error('[StudyAI Edge Function Error]:', error);
  const isQuota =
    error?.status === 429 ||
    error?.message?.includes('RESOURCE_EXHAUSTED') ||
    error?.message?.includes('429');

  return {
    status: isQuota ? 429 : 500,
    body: {
      success: false,
      code: isQuota ? 'RESOURCE_EXHAUSTED' : 'GENERATION_ERROR',
      error: isQuota
        ? 'Cuota de Gemini temporalmente alcanzada en el nivel gratuito. Activa el Modo Demostración para continuar aprendiendo sin pausas.'
        : `Error en la llamada a la IA: ${error?.message || 'Error desconocido'}`,
    },
  };
}
