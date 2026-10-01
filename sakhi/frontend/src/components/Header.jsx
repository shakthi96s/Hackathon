import { ArrowUpRight, Flower2, Menu } from 'lucide-react';

export default function Header({ onStartOver }) {
  return (
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Sakhi home">
        <span className="brand-mark"><Flower2 size={19} strokeWidth={1.8} /></span>
        <span>sakhi<span className="brand-period">.</span></span>
      </a>
      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="#how-it-works">How it works</a>
        <a href="#about">About Sakhi</a>
      </nav>
      <div className="topbar-actions">
        <button className="reset-link" type="button" onClick={onStartOver}>Start over <ArrowUpRight size={15} /></button>
        <button className="mobile-menu" type="button" aria-label="Open menu"><Menu size={20} /></button>
      </div>
    </header>
  );
}