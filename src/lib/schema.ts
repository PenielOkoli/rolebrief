import { z } from 'zod';

const text = (max: number) => z.string().trim().min(1).max(max);
export const localeSchema = z.enum(['en-NG', 'en-GB']);
export type Locale = z.infer<typeof localeSchema>;
const id = z.string().regex(/^[a-z][a-z0-9-]{0,29}$/);
export const overviewSchema = z.object({ role: text(90), company: text(90).nullable(), narrative: text(600) }).strict();
export const requirementSchema = z.object({ id, title: text(90), category: z.enum(['skill', 'experience', 'qualification']), importance: z.enum(['required', 'preferred', 'unclear']), sourceQuote: text(350), explanation: text(260) }).strict();
export const evidenceSchema = z.object({ id, requirementId: id, prompt: text(200), example: text(260) }).strict();
export const taskSchema = z.object({ id, title: text(100), detail: text(300), minutes: z.number().int().min(5).max(120) }).strict();
export const requirementsSchema = z.array(requirementSchema).min(1).max(8);
export const evidenceListSchema = z.array(evidenceSchema).min(1).max(8);
export const tasksSchema = z.array(taskSchema).min(1).max(6);
export const briefSchema = z.object({ schemaVersion: z.literal('1.0'), locale: localeSchema, overview: overviewSchema, requirements: requirementsSchema, evidence: evidenceListSchema, tasks: tasksSchema }).strict();
export const requestSchema = z.object({ description: z.string().trim().min(80).max(12000), locale: localeSchema }).strict();
export type Brief = z.infer<typeof briefSchema>;
export type Requirement = z.infer<typeof requirementSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Section = 'overview' | 'requirements' | 'evidence' | 'tasks';
export type View = { status: 'valid' | 'partial' | 'invalid'; locale: Locale; overview: Brief['overview'] | null; requirements: Requirement[] | null; evidence: Evidence[] | null; tasks: Task[] | null; issues: { path: string; message: string }[]; validated: Brief | null };
const empty = (message: string): View => ({ status: 'invalid', locale: 'en-NG', overview: null, requirements: null, evidence: null, tasks: null, issues: [{ path: 'response', message }], validated: null });

// All network and fixture data enters the UI here, as unknown.
export function decodeBrief(raw: unknown, locale: Locale, source?: string): View {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return empty('A complete JSON object was expected.');
  const value = raw as Record<string, unknown>;
  if (Object.keys(value).some(k => !['schemaVersion', 'locale', 'overview', 'requirements', 'evidence', 'tasks'].includes(k))) return empty('Unexpected response fields. Please try again.');
  if (value.schemaVersion !== '1.0' || value.locale !== locale) return empty('The response version or locale did not match the request.');
  const issues: View['issues'] = [];
  function section<T>(name: Section, schema: z.ZodType<T>): T | null {
    const parsed = schema.safeParse(value[name]);
    if (!parsed.success) {
      parsed.error.issues.slice(0, 4).forEach(i => issues.push({ path: [name, ...i.path].join('.'), message: 'Missing or invalid field. This section was withheld.' }));
      return null;
    }
    return parsed.data;
  }
  const overview = section('overview', overviewSchema);
  let requirements = section('requirements', requirementsSchema);
  let evidence = section('evidence', evidenceListSchema);
  let tasks = section('tasks', tasksSchema);
  const unique = <T extends { id: string }>(name: Section, items: T[] | null): T[] | null => {
    if (items && new Set(items.map(i => i.id)).size !== items.length) { issues.push({ path: name, message: 'Duplicate identifiers. This section was withheld.' }); return null; }
    return items;
  };
  requirements = unique('requirements', requirements);
  evidence = unique('evidence', evidence);
  tasks = unique('tasks', tasks);
  if (requirements && source && requirements.some(r => !source.includes(r.sourceQuote))) {
    issues.push({ path: 'requirements.sourceQuote', message: 'A quoted requirement was not found in the job description.' }); requirements = null;
  }
  if (evidence && (!requirements || evidence.some(e => !requirements!.some(r => r.id === e.requirementId)))) {
    issues.push({ path: 'evidence.requirementId', message: 'Evidence could not be linked to verified requirements.' }); evidence = null;
  }
  const status = !issues.length ? 'valid' : overview || requirements || evidence || tasks ? 'partial' : 'invalid';
  return { status, locale, overview, requirements, evidence, tasks, issues, validated: status === 'valid' ? briefSchema.parse(value) : null };
}
