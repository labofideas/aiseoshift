// Server-only: never forward visitor credentials or cookies.
export class FetchError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function publicUrl(value: string): URL {
  let url: URL;
  try { url = new URL(value); } catch { throw new FetchError('Enter a valid public website URL.'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port)
    throw new FetchError('Use HTTP or HTTPS without credentials or a custom port.');
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!host.includes('.') || host.includes(':') || /^\d+\.\d+\.\d+\.\d+$/.test(host) ||
    /(?:^|\.)(?:localhost|local|internal|lan|home|test|invalid|example)$/.test(host))
    throw new FetchError('Use a public domain name. Private addresses are not supported.', 403);
  url.hostname = host; url.hash = ''; return url;
}
export function publicAddress(ip: string): boolean {
  if (ip.includes(':')) {
    try { ip = new URL(`http://[${ip}]/`).hostname.slice(1,-1); } catch { return false; }
    const [first, second] = ip.split(':').map(part => parseInt(part || '0',16));
    return first >= 0x2000 && first < 0x4000 && first !== 0x2002 && first !== 0x3fff &&
      !(first === 0x2001 && (second <= 0x1ff || second === 0xdb8));
  }
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a,b,c] = p;
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 168 || (b === 0 && [0,2].includes(c)) || (b === 88 && c === 99))) ||
    (a === 198 && ([18,19].includes(b) || (b === 51 && c === 100))) || (a === 203 && b === 0 && c === 113));
}
async function checkDns(host: string, signal: AbortSignal) {
  const addresses: string[] = [];
  for (const type of ['A', 'AAAA']) {
    const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=${type}`, { headers: { accept: 'application/dns-json' }, signal });
    if (!r.ok) throw new FetchError('Could not verify the website address. Try again.', 502);
    const data = await r.json() as { Status: number; Answer?: { type: number; data: string }[] };
    if (data.Status !== 0) throw new FetchError('The website domain could not be resolved.', 502);
    for (const a of data.Answer || []) if ([1,28].includes(a.type)) addresses.push(a.data);
  }
  if (!addresses.length || addresses.some(ip => !publicAddress(ip))) throw new FetchError('Website address is not allowed.', 403);
}
export async function fetchPublic(value: string, kind: 'html' | 'css' = 'html') {
  let url = publicUrl(value);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  const max = kind === 'css' ? 256 * 1024 : 3 * 1024 * 1024;
  try {
    for (let hop = 0; hop <= 4; hop++) {
      await checkDns(url.hostname, controller.signal);
      const r = await fetch(url, { redirect: 'manual', signal: controller.signal, headers: {
        'user-agent': 'AISEOShiftBot/1.0 (+https://aiseoshift.com/ai-seo-tools/)',
        accept: kind === 'css' ? 'text/css,text/plain' : 'text/html,application/xhtml+xml',
      } });
      if ([301,302,303,307,308].includes(r.status)) {
        await r.body?.cancel();
        const location = r.headers.get('location');
        if (!location || hop === 4) throw new FetchError('The website has too many redirects.', 502);
        url = publicUrl(new URL(location, url).href); continue;
      }
      if (!r.ok) { await r.body?.cancel(); throw new FetchError(`Website returned HTTP ${r.status}. Try pasting the page source instead.`, 502); }
      const contentType = r.headers.get('content-type') || '';
      if (!(kind === 'css' ? /text\/(css|plain)/i : /text\/html|application\/xhtml\+xml/i).test(contentType)) {
        await r.body?.cancel(); throw new FetchError(`The URL did not return ${kind === 'css' ? 'a stylesheet' : 'an HTML page'}.`, 415);
      }
      if (Number(r.headers.get('content-length')) > max) { await r.body?.cancel(); throw new FetchError('Response is too large.', 413); }
      const reader = r.body?.getReader();
      if (!reader) throw new FetchError('Website returned an empty response.', 502);
      const chunks: Uint8Array[] = []; let bytes = 0;
      while (true) {
        const { done, value: chunk } = await reader.read(); if (done) break;
        bytes += chunk.byteLength;
        if (bytes > max) { await reader.cancel(); throw new FetchError('Response is too large.', 413); }
        chunks.push(chunk);
      }
      const buffer = new Uint8Array(bytes); let offset = 0;
      for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength; }
      const headers: Record<string,string> = {};
      for (const key of ['server','x-powered-by','cf-ray','x-vercel-id','x-shopify-stage','x-generator']) {
        const v = r.headers.get(key); if (v) headers[key] = v.slice(0,200);
      }
      return { url: url.href, status: r.status, contentType, bytes, html: new TextDecoder().decode(buffer), headers };
    }
    throw new FetchError('Could not follow redirects.', 502);
  } catch (error) {
    if (error instanceof FetchError) throw error;
    throw new FetchError(controller.signal.aborted ? 'Request timed out. Try again or paste page source.' : 'Could not fetch the website. It may block automated requests.', 504);
  } finally { clearTimeout(timer); }
}
const visitors = new Map<string,{ count: number; until: number }>();
export async function rateLimited(request: Request, limiter?: { limit: (input: { key: string }) => Promise<{ success: boolean }> }) {
  const key = request.headers.get('cf-connecting-ip') || 'local';
  if (limiter) return !(await limiter.limit({ key })).success;
  const now = Date.now();
  for (const [ip, entry] of visitors) if (entry.until < now) visitors.delete(ip);
  const entry = visitors.get(key) || { count: 0, until: now + 60000 };
  if (visitors.size >= 5000 && !visitors.has(key)) return true;
  entry.count++; visitors.set(key, entry); return entry.count > 20;
}
export function apiError(error: unknown) {
  const status = error instanceof FetchError ? error.status : 500;
  return Response.json({ error: error instanceof FetchError ? error.message : 'The request could not be completed.' }, {
    status, headers: { 'cache-control': 'no-store', ...(status === 429 ? { 'retry-after': '60' } : {}) },
  });
}
