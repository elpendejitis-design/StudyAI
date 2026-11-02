interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

export function checkEdgeRateLimit(request: Request): {
  allowed: boolean;
  retryAfter?: number;
  clientIp: string;
} {
  const clientIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'edge-client';

  const now = Date.now();
  let record = rateLimits.get(clientIp);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimits.set(clientIp, record);
    return { allowed: true, clientIp };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter, clientIp };
  }

  record.count++;
  return { allowed: true, clientIp };
}

export function createRateLimitResponse(retryAfter: number = 30): Response {
  return new Response(
    JSON.stringify({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      error: `Has superado el límite de ${MAX_REQUESTS_PER_WINDOW} solicitudes por minuto del nivel gratuito. Espera ${retryAfter} segundos o activa el Modo Demostración.`,
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    }
  );
}

export function jsonResponse(data: any, status: number = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      ...extraHeaders,
    },
  });
}
