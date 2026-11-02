import { PagesFunction, Env } from '../../types';
import { getGeminiClient, FREE_TIER_MODEL } from '../../utils/geminiEdge';
import { jsonResponse } from '../../utils/rateLimiter';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { apiKey } = getGeminiClient(context.env);

  return jsonResponse({
    status: 'ok',
    platform: 'Cloudflare Pages Functions',
    hasApiKey: Boolean(apiKey && apiKey.length > 0),
    model: FREE_TIER_MODEL,
    rateLimitWindowSeconds: 60,
    rateLimitMax: 20,
  });
};
