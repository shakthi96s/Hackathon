import { ArrowUpRight, BadgeCheck, ExternalLink, Sparkles } from 'lucide-react';

export default function ResultCard({ result, onRestart, copy }) {
  if (!result) return null;
  return (
    <section className="results-section" aria-live="polite">
      <div className="results-heading">
        <span className="results-icon"><Sparkles size={18} /></span>
        <div><span className="eyebrow">YOUR MATCHES</span><h2>{result.schemes.length ? 'A few places to start' : 'Let’s explore your options'}</h2></div>
      </div>
      {result.schemes.length ? <div className="result-list">
        {result.schemes.map((scheme) => (
          <article className="result-card" key={scheme.id}>
            <div className="result-card-header"><span className="result-category">{scheme.category}</span><BadgeCheck size={19} aria-label="Potential match" /></div>
            <h3>{scheme.name}</h3>
            {scheme.tamilName && <p className="scheme-tamil-name" lang="ta">{scheme.tamilName}</p>}
            <p>{scheme.purpose || scheme.summary}</p>
            <div className="match-reason">Why it may fit: {scheme.matchReason}</div>
            {scheme.eligibility && <div className="scheme-detail"><strong>Eligibility</strong><span>Age {scheme.eligibility.minAge}+ and monthly income up to ₹{scheme.eligibility.maxMonthlyIncome.toLocaleString('en-IN')}.</span></div>}
            {scheme.requiredDocuments?.length > 0 && <div className="scheme-detail"><strong>Documents to ask about</strong><ul>{scheme.requiredDocuments.map((document) => <li key={document}>{document}</li>)}</ul></div>}
            {scheme.applicationMethod && <div className="scheme-detail"><strong>Apply at</strong><span>{scheme.applicationMethod}</span></div>}
            {scheme.steps?.length > 0 && <div className="scheme-detail"><strong>Next steps</strong><ol>{scheme.steps.map((step) => <li key={step}>{step}</li>)}</ol></div>}
            {scheme.help && <div className="scheme-detail"><strong>Help</strong><span>{scheme.help}</span></div>}
            <a className="scheme-link" href={scheme.url} target="_blank" rel="noreferrer">Check official details <ExternalLink size={14} /></a>
            {scheme.applicationUrl && <a className="scheme-link" href={scheme.applicationUrl} target="_blank" rel="noreferrer">Visit WCD website <ExternalLink size={14} /></a>}
          </article>
        ))}
      </div> : <p className="no-match-copy">I didn’t find a close match in this short list. Your local women and child development office or a Common Service Centre can help check other state and district benefits.</p>}
      {result.exploreSchemes?.length > 0 && <div className="explore-schemes">
        <h3>{copy.explore}</h3>
        <p>{copy.exploreNote}</p>
        <div className="explore-list">
          {result.exploreSchemes.map((scheme) => <article className="explore-item" key={scheme.id}>
            <span className="result-category">{scheme.category}</span>
            <h4>{scheme.name}</h4>
            <p>{scheme.summary}</p>
            <a className="scheme-link" href={scheme.url} target="_blank" rel="noreferrer">Official details <ExternalLink size={14} /></a>
          </article>)}
        </div>
      </div>}
      <div className="results-footnote">These are possible matches, not an approval or guarantee. Eligibility and application rules can change; confirm details with the official scheme source.</div>
      <button className="restart-button" type="button" onClick={onRestart}>Check another profile <ArrowUpRight size={15} /></button>
    </section>
  );
}