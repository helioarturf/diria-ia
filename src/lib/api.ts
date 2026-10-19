/**
 * Resolução de URLs da API.
 *
 * O frontend fala sempre com o backend através de caminhos relativos à base
 * do build. Isto permite publicar a aplicação tanto na raiz do domínio
 * (`base: '/'` → `/api/chat`) como numa subpasta
 * (`base: '/diria/'` → `/diria/api/chat`).
 *
 * A base é definida no build através da variável `BASE_PATH` (ver vite.config.ts).
 */

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

/** Converte um caminho da API (ex.: '/api/chat') para a URL final. */
export function apiUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${clean}`;
}
