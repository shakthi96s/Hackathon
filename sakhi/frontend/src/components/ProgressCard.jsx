import { Check, CircleHelp, ShieldCheck } from 'lucide-react';

const labels = ['About you', 'Your household', 'Your needs'];

export default function ProgressCard({ progress, privacyNote }) {
  const activeStep = Math.min(Math.floor(progress / 34), 2);
  return (
    <aside className="side-panel" aria-label="Your application progress">
      <div className="side-panel-topline"><span className="eyebrow">YOUR JOURNEY</span><span className="progress-count">{progress}%</span></div>
      <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
      <div className="step-list">
        {labels.map((label, index) => (
          <div className={`step-item ${index < activeStep ? 'step-done' : ''} ${index === activeStep ? 'step-current' : ''}`} key={label}>
            <span className="step-icon">{index < activeStep ? <Check size={13} /> : <span>{`0${index + 1}`}</span>}</span>
            <span>{label}</span>
            {index === activeStep && <span className="step-dot" />}
          </div>
        ))}
      </div>
      <div className="privacy-note"><ShieldCheck size={17} /><p>{privacyNote || 'Your answers are held only for this chat and used to check possible scheme matches.'}</p></div>
      <div className="help-note"><CircleHelp size={16} /><span>Not sure about an answer? A best guess is okay.</span></div>
    </aside>
  );
}