import { writeFileSync } from 'node:fs';
import { decodeBrief, type Locale } from '../src/lib/schema';
import { sampleDescription } from '../src/lib/sample';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BriefView } from '../src/components/brief-view';
const base = process.argv[2] || 'https://rolebrief-beta.vercel.app';
const live = process.argv.includes('--live');
const checks: Record<string, unknown>[] = [];
let failed = false;
async function check(name: string, path: string, init: RequestInit | undefined, status: number) {
  const response = await fetch(`${base}${path}`, init);
  checks.push({ name, status: response.status, expected: status, passed: response.status === status });
  if (response.status !== status) failed = true;
  return response;
}
async function main() {
for (const path of ['/', '/schema']) await check(path, path, undefined, 200);
for (const [name, body, type, status, origin] of [
  ['invalid request', '{}', 'application/json', 400, undefined],
  ['malformed JSON', '{', 'application/json', 400, undefined],
  ['wrong media type', '{}', 'text/plain', 415, undefined],
  ['oversized body', 'x'.repeat(60001), 'application/json', 413, undefined],
  ['foreign origin', '{}', 'application/json', 403, 'https://other.example'],
] as const) await check(name, '/api/brief', { method: 'POST', headers: { 'content-type': type, ...(origin ? { origin } : {}) }, body }, status);
for (const locale of ['en-NG', 'en-GB'] as Locale[]) {
  const response = await fetch(`${base}/api/brief`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ description: sampleDescription, locale }) });
  const body = await response.json();
  if (!live) { checks.push({ name: 'configuration status', locale, status: response.status, configured: response.status !== 503 }); continue; }
  const view = decodeBrief(body.output, locale, sampleDescription);
  const html = renderToStaticMarkup(<BriefView view={view}/>);
  const passed = response.status === 200 && body.source === 'groq' && view.status === 'valid' && html.includes('<table>') && html.includes('type="checkbox"');
  if (!passed) failed = true;
  checks.push({ name: 'live analysis', locale, status: response.status, source: body.source ?? null, validation: view.status, rendering: passed, passed, ...(body.diagnostics ? { diagnostics: body.diagnostics } : {}) });
}
const report = { checkedAt: new Date().toISOString(), url: base, liveRequested: live, passed: !failed, checks };
writeFileSync('docs/modules/04/live-verification.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failed) process.exitCode = 1;
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Verification failed.'); process.exitCode = 1; });
