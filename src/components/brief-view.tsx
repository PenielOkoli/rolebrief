import { ArrowUpRight, Check, Clock3, FileCheck2, ListChecks, Quote } from 'lucide-react';
import type { View } from '../lib/schema';
export function Fallback({ title }: { title: string }) {
  return <div className="fallback" role="status"><FileCheck2 size={22} /><div><strong>{title} needs another look</strong><p>We couldn’t verify this section, so we’ve kept it out of your brief. Retry analysis or restore the example.</p></div></div>;
}
export function BriefView({ view, checked = [], toggle = () => {} }: { view: View; checked?: string[]; toggle?: (id: string) => void }) {
  if (view.status === 'invalid') return <div className="full-fallback"><FileCheck2 size={36}/><h2>We couldn’t build a reliable brief.</h2><p>The response didn’t match the expected format. Nothing from it has been added to your workspace.</p><p>Try analyzing again, or use “Restore example” below.</p></div>;
  return <>
    {view.overview ? <section className="overview"><div className="eyebrow">YOUR ROLE, AT A GLANCE</div><h2>{view.overview.role}</h2><div className="company">{view.overview.company ?? 'Company not specified'}<span>Application brief</span></div><p>{view.overview.narrative}</p></section> : <Fallback title="Role overview"/>}
    <section id="requirements" className="section"><div className="section-heading"><div><span className="step">01</span><h2>What they’re looking for</h2></div><span className="muted">{view.requirements?.length ?? '—'} requirements</span></div>
      {view.requirements ? <div className="requirements-grid">{view.requirements.map(r => <article className="requirement" key={r.id}><div className="card-top"><span className={`pill ${r.importance}`}>{r.importance === 'unclear' ? 'Not specified' : r.importance}</span><span className="category">{r.category}</span></div><h3>{r.title}</h3><p>{r.explanation}</p><details><summary><Quote size={13}/> From the job description</summary><blockquote>{r.sourceQuote}</blockquote></details></article>)}</div> : <Fallback title="Requirements"/>}
    </section>
    <section id="evidence" className="section"><div className="section-heading"><div><span className="step">02</span><h2>Back it up with evidence</h2></div><FileCheck2 size={20}/></div><p className="section-intro">Tick only what you can support with your own work. Examples are suggestions, not claims about you.</p>
      {view.evidence ? <div className="evidence-list">{view.evidence.map((e, i) => <label className={`evidence-row ${checked.includes(e.id) ? 'complete' : ''}`} key={e.id}><input type="checkbox" checked={checked.includes(e.id)} onChange={() => toggle(e.id)}/><span className="custom-check">{checked.includes(e.id) && <Check size={13}/>}</span><span className="evidence-copy"><strong>{e.prompt}</strong><span><b>Illustrative example only: </b>{e.example}</span></span><span className="row-number">{String(i + 1).padStart(2, '0')}</span></label>)}</div> : <Fallback title="Evidence checklist"/>}
    </section>
    <section id="preparation" className="section"><div className="section-heading"><div><span className="step">03</span><h2>Your next moves</h2></div><ListChecks size={20}/></div>
      {view.tasks ? <div className="task-table"><table><caption className="sr-only">Suggested application preparation tasks</caption><thead><tr><th>Preparation task</th><th>Time estimate</th></tr></thead><tbody>{view.tasks.map(t => <tr key={t.id}><td><strong>{t.title}</strong><p>{t.detail}</p></td><td><span className="time"><Clock3 size={13}/>{new Intl.NumberFormat(view.locale).format(t.minutes)} min</span></td></tr>)}</tbody></table></div> : <Fallback title="Preparation tasks"/>}
    </section><div className="review-note"><ArrowUpRight size={16}/><p>You bring the experience. RoleBrief helps you organise it.<br/><span>Review the original listing before applying. Nothing is submitted for you.</span></p></div>
  </>;
}
