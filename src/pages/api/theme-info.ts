import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { apiError, FetchError, fetchPublic, publicUrl, rateLimited } from '../../lib/tools/public-fetch';
export const prerender = false;
export const GET: APIRoute = async ({ request }) => {
  try {
    const limiter = (env as unknown as { TOOL_RATE_LIMITER?: Parameters<typeof rateLimited>[1] }).TOOL_RATE_LIMITER;
    if (await rateLimited(request, limiter)) throw new FetchError('Too many requests. Please wait a minute.', 429);
    const url = publicUrl(new URL(request.url).searchParams.get('url') || '');
    if (!/\/wp-content\/themes\/[a-z0-9_-]+\/style\.css$/i.test(url.pathname)) throw new FetchError('Only discovered WordPress theme stylesheets are supported.');
    const result = await fetchPublic(url.href, 'css');
    const fields: Record<string,string> = {};
    for (const name of ['Theme Name','Theme URI','Author','Version','Template']) {
      const match = result.html.slice(0,8192).match(new RegExp('^[ \\t/*#@]*' + name + ':\\s*(.*?)\\s*$', 'im'));
      if (match) fields[name] = match[1].replace(/\*\/$/, '').trim().slice(0,200);
    }
    return Response.json({ url: result.url, fields }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) { return apiError(error); }
};
