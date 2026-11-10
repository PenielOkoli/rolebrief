'use client';
import { useRef, useState } from 'react';
import { ArrowDownToLine, ArrowRight, ArrowUpRight, Braces, Check, ChevronDown, FileText, FlaskConical, Layers3, LoaderCircle, Plus, RotateCcw, ShieldCheck, Sparkles, Target, X } from 'lucide-react';
import { decodeBrief, type Locale } from '@/lib/schema';
import { fixture, sampleDescription, scenarios } from '@/lib/sample';
import { BriefView } from './brief-view';

export function Workspace({ configured }: { configured: boolean }) {
  const [description, setDescription] = useState(sampleDescription);
  const [locale, setLocale] = useState<Locale>('en-NG');
  const [result, setResult] = useState<{raw: unknown; locale: Locale; source: string; description: string}>(() => ({ raw: fixture('Valid sample', 'en-NG'), locale: 'en-NG', source: 'Example brief', description: sampleDescription }));
  const [checked, setChecked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [lab, setLab] = useState(false);
  const [json, setJson] = useState(false);
  const [scenario, setScenario] = useState('Valid sample');
  const controller = useRef<AbortController | null>(null);
  const jobInput = useRef<HTMLTextAreaElement | null>(null);
  const view = decodeBrief(result.raw, result.locale, result.description);
  const evidenceCount = view.evidence?.length ?? 0;
  const done = checked.filter(id => view.evidence?.some(e => e.id === id)).length;
  const totalMinutes = view.tasks?.reduce((sum, t) => sum + t.minutes, 0);
  function restore() {
    setResult({ raw: fixture('Valid sample', locale), locale, source: 'Example brief', description: sampleDescription });
    setDescription(sampleDescription); setChecked([]); setScenario('Valid sample'); setError('');
  }
  async function analyze() {
    if (description.trim().length < 80) { setError('Add at least 80 characters from the job description.'); jobInput.current?.focus(); return; }
    setBusy(true); setError(''); const abort = new AbortController(); controller.current = abort;
    try {
      const response = await fetch('/api/brief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description, locale }), signal: abort.signal });
      const body = await response.json();
      if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'Analysis failed. Please try again.');
      const parsed = decodeBrief(body.output, locale, description);
      if (parsed.status !== 'valid' || body.source !== 'groq') throw new Error('The response failed validation. Your previous brief has been kept.');
      setResult({ raw: parsed.validated, locale, source: 'AI-generated brief', description }); setChecked([]); setScenario('Valid sample');
    } catch (e) { setError(abort.signal.aborted ? 'Analysis cancelled. Your previous brief has been kept.' : e instanceof Error ? e.message : 'Could not connect. Please try again.'); }
    finally { setBusy(false); controller.current = null; }
  }
  function exportBrief() {
    if (!view.validated) return;
    const blob = new Blob([JSON.stringify({ source: result.source, output: view.validated, applicantConfirmedEvidenceIds: checked, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'rolebrief.json'; a.click(); URL.revokeObjectURL(url);
  }
  return <div className="app-shell"><a className="skip" href="#main">Skip to workspace</a>
    <aside className="sidebar"><a className="brand" href="/" aria-label="RoleBrief home"><span className="brand-icon"><Layers3 size={23}/></span>rolebrief<span className="brand-dot">.</span></a><span className="workspace-label">YOUR WORKSPACE</span><nav aria-label="Workspace navigation"><a href="#main" className="nav-active"><FileText size={18}/>Application brief<span className="nav-dot"/></a><a href="#evidence"><ShieldCheck size={18}/>Evidence checklist</a><a href="#preparation"><Target size={18}/>Preparation plan</a></nav><div className="sidebar-bottom"><div className="sidebar-art"><span/><span/><span/><ArrowUpRight size={28}/></div><h3>A little clarity.<br/>A stronger next step.</h3><p>Make room for your next opportunity.</p><a href="/schema"><Braces size={16}/>Behind the brief<ArrowUpRight size={14}/></a><small>FLEXISAF · DELIVERABLE 04</small></div></aside>
    <div className="main-shell"><header className="topbar"><div><span className="breadcrumb">Workspace</span><span className="slash">/</span><strong>Application brief</strong></div><span className="private-label"><span/>Private to this session</span></header>
    <main id="main"><div className="page-heading"><div><div className="eyebrow">THE NEXT CHAPTER STARTS HERE</div><h1>Make your next move count<span>.</span></h1><p>From a wall of job requirements to a plan you can act on.</p></div><button className="new-brief" disabled={busy} onClick={() => { setDescription(''); setError(''); jobInput.current?.focus(); }}><Plus size={16}/>New job</button></div>
      <div className="workspace-grid"><aside className="input-column"><section className="input-panel"><div className="panel-title"><span className="number-icon">1</span><h2>Start with the opportunity</h2></div><p>Paste the job description. We’ll help you find the signal.</p><label htmlFor="description">Job description</label><textarea id="description" ref={jobInput} value={description} maxLength={12000} disabled={busy} onChange={e => setDescription(e.target.value)} placeholder="Paste the responsibilities, requirements, and application instructions here…"/><div className="input-meta"><button className="text-button" disabled={busy} onClick={restore}>Try an example<ArrowUpRight size={12}/></button><span>{description.length.toLocaleString(locale)} / 12,000</span></div><label htmlFor="locale">Output locale</label><div className="select-wrap"><select id="locale" value={locale} disabled={busy} onChange={e => setLocale(e.target.value as Locale)}><option value="en-NG">English · Nigeria</option><option value="en-GB">English · United Kingdom</option></select><ChevronDown size={14}/></div><button className="primary" disabled={busy} onClick={analyze}>{busy ? <><LoaderCircle className="spin" size={17}/>Building your brief…</> : <><Sparkles size={17}/>Analyze opportunity<ArrowRight size={17}/></>}</button>{busy && <button className="cancel" onClick={() => controller.current?.abort()}><X size={14}/>Cancel analysis</button>}<div aria-live="polite">{error && <p className="error" role="alert">{error}</p>}</div><p className="privacy-copy"><ShieldCheck size={14}/>Only the job description is sent to Groq when you analyze. Skip personal or confidential details.</p><div className={`connection ${configured ? 'online' : ''}`}><span/>{configured ? 'AI analysis available' : 'Example mode · AI setup pending'}</div></section>
      <section className="progress-panel"><div className="progress-title"><span className="mini-icon"><Check size={18}/></span><span>Your evidence, in focus</span></div><div className="progress-number">{done}<span> / {evidenceCount} ready</span></div><div className="progress-track" role="progressbar" aria-label="Evidence confirmed" aria-valuenow={done} aria-valuemin={0} aria-valuemax={evidenceCount || 1}><span style={{ width: `${evidenceCount ? done / evidenceCount * 100 : 0}%` }}/></div><p>Your own checklist, not a match score.<br/>Progress lasts for this page session.</p></section><div className="tiny-note"><Sparkles size={16}/><p>A clearer application starts with<br/>what you can honestly show.</p></div></aside>
      <div className="output-column" aria-busy={busy}><div className="output-toolbar"><div><span className="source-badge"><span/>{result.source}</span><span className={`validation-badge ${view.status}`}><ShieldCheck size={13}/>{view.status === 'valid' ? 'Structure verified' : view.status === 'partial' ? 'Partial response' : 'Needs recovery'}</span></div><button className="export-button" onClick={exportBrief} disabled={!view.validated || busy}><ArrowDownToLine size={15}/>Export</button></div><div className="brief-paper"><div className="paper-header"><span><FileText size={15}/>OPPORTUNITY BRIEF</span><span>{result.locale} {totalMinutes ? `· ${totalMinutes} min prep` : ''}</span></div><BriefView view={view} checked={checked} toggle={id => setChecked(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id])}/></div>
      <section className="lab-panel"><div className="lab-toolbar"><button onClick={() => setLab(!lab)} aria-expanded={lab}><FlaskConical size={16}/>Validation lab<ChevronDown size={14}/></button><button onClick={() => setJson(!json)} aria-expanded={json}><Braces size={15}/>View JSON</button></div>{lab && <div className="lab-content"><h3>What happens when AI gets it wrong?</h3><p>These simulated responses test the same validation boundary as live output.</p><label htmlFor="scenario">Response scenario</label><select id="scenario" disabled={busy} value={scenario} onChange={e => { setScenario(e.target.value); setResult({ raw: fixture(e.target.value, locale), locale, source: 'Test fixture', description: sampleDescription }); setChecked([]); setError(''); }} >{scenarios.map(s => <option key={s}>{s}</option>)}</select><div className="validation-results" role="status">{view.issues.length ? <ul>{view.issues.map((issue, i) => <li key={i}><code>{issue.path}</code> — {issue.message}</li>)}</ul> : <p><Check size={14}/>All sections passed. Export is available.</p>}</div><p className="muted">Export is disabled when any section fails validation.</p></div>}{json && <pre className="json-output">{JSON.stringify(result.raw, null, 2)}</pre>}<div className="lab-footer"><button onClick={restore} disabled={busy}><RotateCcw size={13}/>Restore example</button><a href="/schema">Explore the output schema<ArrowUpRight size={13}/></a></div></section>
      </div></div><footer>Built for your next chapter.<span>RoleBrief · Structured outputs, thoughtful next steps.</span></footer>
    </main></div></div>;
}
