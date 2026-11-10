import { z } from 'zod';
import { briefSchema, requirementSchema } from './schema';

// Segment application input, not model prose. Each option remains an exact
// substring of the original listing; the provider selects an allowed quote.
export function sourceQuotes(description: string): [string, ...string[]] {
  const sentences = description.match(/[^.!?\n]+[.!?]?/g) ?? [description];
  const quotes = [...new Set(sentences.flatMap(s => s.match(/[\s\S]{1,350}/g) ?? []).map(s => s.trim()).filter(Boolean))];
  return (quotes.length ? quotes : [description.slice(0, 350)]) as [string, ...string[]];
}
export function providerSchema(description: string) {
  return briefSchema.extend({ requirements: z.array(requirementSchema.extend({ sourceQuote: z.enum(sourceQuotes(description)) })).min(1).max(8) });
}
export function providerErrorCode(error: unknown): string | undefined {
  try {
    const responseBody = (error as { responseBody?: string }).responseBody;
    const code: unknown = responseBody ? JSON.parse(responseBody)?.error?.code : undefined;
    return typeof code === 'string' && /^[a-z_]{1,60}$/.test(code) ? code : undefined;
  } catch { return undefined; }
}
