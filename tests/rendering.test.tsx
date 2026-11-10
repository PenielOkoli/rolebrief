import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { z } from 'zod';
import { BriefView } from '../src/components/brief-view';
import { briefSchema, decodeBrief, requestSchema } from '../src/lib/schema';
import { fixture, sample, sampleDescription } from '../src/lib/sample';
import { readJSON, RequestError } from '../src/lib/http';
import { providerSchema, sourceQuotes, providerErrorCode } from '../src/lib/provider-schema';
const decode = (name: string) => decodeBrief(fixture(name, 'en-NG'), 'en-NG', sampleDescription);
const render = (name: string) => renderToStaticMarkup(<BriefView view={decode(name)}/>);

test('provider quote options are bounded verbatim substrings even for long multiline input', () => {
  const input = `A role.\n${'Long requirement '.repeat(100)}\nFinal requirement!`;
  for (const quote of sourceQuotes(input)) { assert.ok(input.includes(quote)); assert.ok(quote.length <= 350); assert.ok(quote.length > 0); }
  const data = structuredClone(sample); data.requirements[0].sourceQuote = 'This requirement was invented.';
  assert.equal(providerSchema(sampleDescription).safeParse(data).success, false);
});
test('provider diagnostics reveal only a bounded error code, never raw response content', () => {
  assert.equal(providerErrorCode({ responseBody: JSON.stringify({ error: { code: 'json_validate_failed', message: 'private response' } }) }), 'json_validate_failed');
  assert.equal(providerErrorCode({ responseBody: 'private invalid JSON' }), undefined);
  assert.equal(providerErrorCode({ responseBody: JSON.stringify({ error: { code: 'private response with spaces' } }) }), undefined);
});

test('valid data renders requirement cards, checkboxes, and a real task table', () => {
  const html = render('Valid sample');
  assert.equal(decode('Valid sample').status, 'valid');
  assert.equal((html.match(/class="requirement"/g) || []).length, 4);
  assert.equal((html.match(/type="checkbox"/g) || []).length, 4);
  assert.equal((html.match(/Illustrative example only:/g) || []).length, 4);
  assert.match(html, /<table>/); assert.match(html, /Junior Frontend Developer/);
});
for (const name of ['Unexpected field', 'Wrong locale', 'Truncated JSON']) test(`${name} rejects the envelope and renders full recovery`, () => {
  const view = decode(name); assert.equal(view.status, 'invalid'); assert.equal(view.validated, null);
  const html = render(name); assert.match(html, /couldn’t build a reliable brief/); assert.doesNotMatch(html, /type="checkbox"|<table>/);
});
test('missing requirements withholds dependent evidence but preserves valid tasks', () => {
  const view = decode('Missing requirements'); assert.equal(view.status, 'partial'); assert.equal(view.requirements, null); assert.equal(view.evidence, null);
  const html = render('Missing requirements'); assert.match(html, /Requirements needs another look/); assert.match(html, /<table>/); assert.doesNotMatch(html, /type="checkbox"/);
});
test('incomplete tasks hide the entire task table and retain requirements', () => {
  const view = decode('Incomplete task'); assert.equal(view.tasks, null); assert.equal(view.validated, null);
  const html = render('Incomplete task'); assert.doesNotMatch(html, /<table>/); assert.match(html, /React &amp; TypeScript/);
});
test('empty evidence shows a fallback instead of a misleading empty checklist', () => {
  assert.equal(decode('Empty evidence').evidence, null); assert.doesNotMatch(render('Empty evidence'), /type="checkbox"/);
});
test('duplicate identifiers fail section validation', () => {
  assert.equal(decode('Duplicate IDs').requirements, null);
  for (const key of ['evidence', 'tasks'] as const) {
    const data = structuredClone(sample); (data[key] as unknown[]) = [data[key][0], data[key][0]];
    assert.equal(decodeBrief(data, 'en-NG', sampleDescription)[key], null);
  }
});
test('invented source quotes cannot render requirements or linked evidence', () => {
  assert.equal(decode('Unverified quote').requirements, null); assert.equal(decode('Unverified quote').evidence, null);
  assert.doesNotMatch(render('Unverified quote'), /Ten years of experience/);
});
test('broken evidence references are withheld', () => {
  const data = structuredClone(sample); data.evidence[0].requirementId = 'missing';
  assert.equal(decodeBrief(data, 'en-NG', sampleDescription).evidence, null);
});
test('React escapes HTML-like content and never creates a script element', () => {
  const html = render('HTML-like text'); assert.match(html, /&lt;script&gt;/); assert.doesNotMatch(html, /<script>/);
});
test('nested extra fields and unknown importance cannot select UI behavior', () => {
  for (const change of [{ importance: 'guaranteed-fit' }, { extra: 'untrusted' }]) {
    const data = structuredClone(sample); Object.assign(data.requirements[0], change);
    assert.equal(decodeBrief(data, 'en-NG', sampleDescription).requirements, null);
  }
});
test('all missing sections renders full recovery', () => {
  assert.equal(decodeBrief({ schemaVersion: '1.0', locale: 'en-NG' }, 'en-NG').status, 'invalid');
});
test('locale mismatch fails closed; both supported locales pass when matching', () => {
  assert.equal(decodeBrief(sample, 'en-GB').status, 'invalid');
  assert.equal(decodeBrief({ ...sample, locale: 'en-GB' }, 'en-GB', sampleDescription).status, 'valid');
});
test('null company renders an honest unknown label', () => {
  const data = structuredClone(sample); data.overview.company = null;
  assert.match(renderToStaticMarkup(<BriefView view={decodeBrief(data, 'en-NG')}/>), /Company not specified/);
});
test('diagnostic paths contain no supplied values', () => {
  const data = structuredClone(sample); (data.tasks[0].minutes as unknown) = 'private-value';
  const view = decodeBrief(data, 'en-NG'); assert.match(JSON.stringify(view.issues), /tasks.0.minutes/); assert.doesNotMatch(JSON.stringify(view.issues), /private-value/);
});
test('excessive lengths and arrays, negative estimates, and empty text fail', () => {
  for (const modify of [
    (d: typeof sample) => { d.tasks[0].minutes = -1; },
    (d: typeof sample) => { d.overview.role = ' '; },
    (d: typeof sample) => { d.overview.narrative = 'a'.repeat(601); },
    (d: typeof sample) => { d.requirements = Array(9).fill(d.requirements[0]); },
  ]) { const data = structuredClone(sample); modify(data); assert.notEqual(decodeBrief(data, 'en-NG').status, 'valid'); }
});
test('request boundary rejects short descriptions, extra fields and unsupported locales', () => {
  assert.equal(requestSchema.safeParse({ description: sampleDescription, locale: 'en-NG' }).success, true);
  for (const input of [{ description: 'short', locale: 'en-NG' }, { description: sampleDescription, locale: 'fr' }, { description: sampleDescription, locale: 'en-NG', token: 'extra' }, { description: 'a'.repeat(12001), locale: 'en-NG' }]) assert.equal(requestSchema.safeParse(input).success, false);
});
test('HTTP body reader rejects malformed, oversized and wrong-media-type bodies', async () => {
  for (const [body, type, status] of [['{', 'application/json', 400], ['x'.repeat(60001), 'application/json', 413], ['{}', 'text/plain', 415]] as const) {
    await assert.rejects(readJSON(new Request('https://example.test', { method: 'POST', headers: { 'content-type': type }, body })), e => e instanceof RequestError && e.status === status);
  }
});
test('JSON Schema is strict and keeps metadata, prose and UI data separate', () => {
  const schema = z.toJSONSchema(briefSchema); assert.equal(schema.additionalProperties, false);
  for (const key of ['locale', 'schemaVersion', 'overview', 'requirements', 'evidence', 'tasks']) assert.ok(schema.properties?.[key]);
});
