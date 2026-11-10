export class RequestError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function readJSON(request: Request): Promise<unknown> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new RequestError(415, 'Send JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, 'Empty request.');
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > 60000) { await reader.cancel(); throw new RequestError(413, 'The request is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new RequestError(400, 'Invalid JSON.'); }
}
