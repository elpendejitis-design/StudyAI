import { PagesFunction, Env } from '../../types';
import { getGeminiClient, PRIMARY_FREE_MODEL, FALLBACK_FREE_MODEL, VALID_FREE_MODELS } from '../../utils/geminiEdge';
import { jsonResponse } from '../../utils/rateLimiter';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { apiKey } = getGeminiClient(context.env);

  return jsonResponse({
    status: 'ok',
    platform: 'Cloudflare Pages Functions',
    hasApiKey: Boolean(apiKey && apiKey.length > 0),
    model: PRIMARY_FREE_MODEL,
    fallbackModel: FALLBACK_FREE_MODEL,
    availableFreeModels: VALID_FREE_MODELS,
    rateLimitWindowSeconds: 60,
    rateLimitMax: 20,
    retryConfig: {
      maxRetries: 2,
      backoff: 'exponential_with_jitter',
      fallbackOn503: true,
      timeoutMs: 25000,
    },
  });
};
