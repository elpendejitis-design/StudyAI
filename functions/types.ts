/**
 * Cloudflare Pages Functions Type Definitions
 */

export interface Env {
  GEMINI_API_KEY?: string;
  [key: string]: any;
}

export interface EventContext<Env = any, P extends string = any, Data = any> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<P, string | string[]>;
  data: Data;
}

export type PagesFunction<Env = any, P extends string = any, Data = any> = (
  context: EventContext<Env, P, Data>
) => Response | Promise<Response>;
