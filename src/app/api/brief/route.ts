import { decodeBrief, requestSchema, type View } from '@/lib/schema';
import { readJSON, RequestError } from '@/lib/http';
import { configured, generateBrief } from '@/lib/server/generate';
import { providerErrorCode } from '@/lib/provider-schema';
export const runtime = 'nodejs';
export const maxDuration = 60;
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
let started = 0, calls = 0, active = 0;
export async function POST(request: Request) {
  if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'This origin is not allowed.' }, 403);
  let input: unknown;
  try { input = await readJSON(request); }
  catch (error) { return reply({ error: error instanceof RequestError ? error.message : 'Invalid request.' }, error instanceof RequestError ? error.status : 400); }
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return reply({ error: 'Use a job description of 80–12,000 characters and a supported locale.' }, 400);
  if (!configured()) return reply({ error: 'Live analysis is not configured. Explore the labeled example and validation lab.' }, 503);
  if (Date.now() - started > 60000) { started = Date.now(); calls = 0; }
  if (calls >= 8 || active >= 2) return reply({ error: 'Too many requests. Please try again in a minute.' }, 429);
  active++; calls++;
  try {
    const { description, locale } = parsed.data;
    const deadline = AbortSignal.any([request.signal, AbortSignal.timeout(50000)]);
    let correction: string | undefined;
    let diagnostics: View['issues'] = [];
    for (let attempt = 0; attempt < 2; attempt++) {
      let output: unknown;
      try { output = await generateBrief(description, locale, deadline, correction); }
      catch (error) {
        const code = providerErrorCode(error);
        const name = (error as { name?: string }).name;
        if (code === 'json_validate_failed' || name === 'AI_NoObjectGeneratedError' || name === 'AI_NoOutputGeneratedError') {
          correction = 'The previous response was not valid structured output. Return a complete object satisfying all field bounds and allowed values. Select sourceQuote from allowedSourceQuotes exactly.';
          diagnostics = [{ path: 'response', message: 'The provider could not produce valid structured data.' }];
          continue;
        }
        throw error;
      }
      const view = decodeBrief(output, locale, description);
      if (view.status === 'valid') return reply({ output: view.validated, source: 'groq' });
      diagnostics = view.issues;
      // One bounded regeneration. Only safe diagnostic paths enter feedback.
      correction = `The previous response failed at: ${view.issues.map(i => i.path).join(', ')}. Copy sourceQuote verbatim from the description, including case and punctuation. Use unique IDs and link evidence to existing requirements. Return a complete replacement matching every schema constraint.`;
    }
    return reply({ error: 'The AI response failed validation after a retry. Your previous brief has been kept. Try again.', diagnostics }, 422);
  } catch (error) {
    // Log only error classification, never provider response bodies or prompts.
    const failure = error as { name?: string; statusCode?: number; cause?: { name?: string; statusCode?: number } };
    console.warn('RoleBrief provider failure', { name: failure.name, status: failure.statusCode, code: providerErrorCode(error), causeName: failure.cause?.name, causeStatus: failure.cause?.statusCode });
    if (failure.statusCode === 429) return reply({ error: 'The AI provider is busy. Your previous brief has been kept. Please try again in a minute.' }, 429);
    return reply({ error: 'Analysis could not be completed. Your previous brief has been kept. Please try again.' }, 502);
  } finally { active--; }
}
