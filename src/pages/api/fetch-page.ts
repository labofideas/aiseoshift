import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { apiError, FetchError, fetchPublic, rateLimited } from '../../lib/tools/public-fetch';
export const prerender = false;
export const GET: APIRoute = async ({ request }) => {
  try {
    const limiter = (env as unknown as { TOOL_RATE_LIMITER?: Parameters<typeof rateLimited>[1] }).TOOL_RATE_LIMITER;
    if (await rateLimited(request, limiter)) throw new FetchError('Too many requests. Please wait a minute.', 429);
    const target = new URL(request.url).searchParams.get('url');
    if (!target) throw new FetchError('Missing URL.');
    return Response.json(await fetchPublic(target), { headers: { 'cache-control': 'no-store' } });
  } catch (error) { return apiError(error); }
};
