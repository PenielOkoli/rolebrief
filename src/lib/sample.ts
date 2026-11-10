import type { Brief, Locale } from './schema';
export const sampleDescription = `Junior Frontend Developer · Northstar Studio\nWe build thoughtful digital products for small businesses.\nRequired: Build responsive interfaces with React and TypeScript. Work with REST APIs and handle loading and error states. Use Git and communicate clearly in code reviews.\nPreferred: Experience with accessibility and component testing.\nInclude a portfolio link and a short explanation of one project you built. Remote, full-time. Applications are reviewed on a rolling basis.`;
export const sample: Brief = {
  schemaVersion: '1.0', locale: 'en-NG',
  overview: { role: 'Junior Frontend Developer', company: 'Northstar Studio', narrative: 'A frontend role focused on practical product work. Prepare examples that show how you build usable interfaces, handle API failures, and explain your decisions. The listing does not specify a salary or a fixed deadline.' },
  requirements: [
    { id: 'interfaces', title: 'React & TypeScript', category: 'skill', importance: 'required', sourceQuote: 'Build responsive interfaces with React and TypeScript.', explanation: 'Show a responsive project and explain how types guide your components.' },
    { id: 'apis', title: 'API integration', category: 'skill', importance: 'required', sourceQuote: 'Work with REST APIs and handle loading and error states.', explanation: 'Prepare a walkthrough of loading, success, empty, and failure states.' },
    { id: 'collaboration', title: 'Git & clear communication', category: 'experience', importance: 'required', sourceQuote: 'Use Git and communicate clearly in code reviews.', explanation: 'Find a commit or review that explains a decision you made.' },
    { id: 'quality', title: 'Accessibility & testing', category: 'skill', importance: 'preferred', sourceQuote: 'Experience with accessibility and component testing.', explanation: 'If you have relevant work, show a keyboard interaction or meaningful component test.' },
  ],
  evidence: [
    { id: 'project', requirementId: 'interfaces', prompt: 'Choose a responsive project you actually built.', example: 'Possible evidence: a repository, live demo, and a short explanation of your own contribution.' },
    { id: 'error-state', requirementId: 'apis', prompt: 'Find one API integration with a useful error state.', example: 'Possible evidence: a component that handles failed requests and lets a user retry.' },
    { id: 'review', requirementId: 'collaboration', prompt: 'Choose a Git commit or code review you can explain.', example: 'Possible evidence: a small change with a clear commit message and reasoning.' },
    { id: 'test', requirementId: 'quality', prompt: 'Add an accessibility or testing example, if you have one.', example: 'Possible evidence: a keyboard check or a test for incomplete API data.' },
  ],
  tasks: [
    { id: 'portfolio', title: 'Pick your strongest project', detail: 'Check that the demo works and the README explains what you built.', minutes: 20 },
    { id: 'story', title: 'Prepare a short project story', detail: 'Write down the problem, your contribution, one tradeoff, and what you learned.', minutes: 15 },
    { id: 'review-application', title: 'Review the application requirements', detail: 'Include the requested portfolio link. Check every claim against your own experience.', minutes: 10 },
  ],
};
export const scenarios = ['Valid sample', 'Missing requirements', 'Incomplete task', 'Empty evidence', 'Duplicate IDs', 'Unexpected field', 'Wrong locale', 'Truncated JSON', 'Unverified quote', 'HTML-like text'] as const;
export function fixture(name: string, locale: Locale): unknown {
  const data = structuredClone({ ...sample, locale });
  if (name === 'Missing requirements') return { ...data, requirements: undefined };
  if (name === 'Incomplete task') return { ...data, tasks: [{ id: 'unfinished', title: 'Incomplete' }] };
  if (name === 'Empty evidence') return { ...data, evidence: [] };
  if (name === 'Duplicate IDs') return { ...data, requirements: [data.requirements[0], data.requirements[0]] };
  if (name === 'Unexpected field') return { ...data, secretInstruction: 'untrusted' };
  if (name === 'Wrong locale') return { ...data, locale: 'fr-FR' };
  if (name === 'Truncated JSON') return '{"overview":';
  if (name === 'Unverified quote') data.requirements[0].sourceQuote = 'Ten years of experience required.';
  if (name === 'HTML-like text') data.overview.role = '<script>alert("test")</script>';
  return data;
}
