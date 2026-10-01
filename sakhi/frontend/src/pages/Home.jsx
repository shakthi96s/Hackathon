import { useEffect, useRef, useState } from 'react';
import { ArrowUp, BadgeCheck, Baby, CircleAlert, CircleHelp, Coins, HandCoins, Keyboard, Languages, LoaderCircle, Mic, PersonStanding, Play, RotateCcw, Sparkles, UserRound, UsersRound } from 'lucide-react';
import ChatBubble from '../components/ChatBubble.jsx';
import Header from '../components/Header.jsx';
import ProgressCard from '../components/ProgressCard.jsx';
import ResultCard from '../components/ResultCard.jsx';
import VoiceButton from '../components/VoiceButton.jsx';
import { resetSession, sendMessage } from '../services/api.js';
import { isSpeechRecognitionSupported, startListening, stopListening } from '../utils/speechRecognition.js';
import { LANGUAGES } from '../utils/languages.js';
import { speakText } from '../utils/textToSpeech.js';

const demoData = ['20', 'திருநெல்வேலி', '15000'];

export default function Home() {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('sakhi-language');
    return LANGUAGES[savedLanguage] ? savedLanguage : 'ta';
  });
  const copy = LANGUAGES[language];
  const ageChoices = [
    { value: '18', label: copy.ageRanges[0], Icon: Baby },
    { value: '19', label: copy.ageRanges[1], Icon: PersonStanding },
    { value: '30', label: copy.ageRanges[2], Icon: UserRound },
    { value: '45', label: copy.ageRanges[3], Icon: UsersRound },
  ];
  const incomeChoices = [
    { value: '10000', label: copy.incomeRanges[0], Icon: Coins },
    { value: '20000', label: copy.incomeRanges[1], Icon: HandCoins },
    { value: '30000', label: copy.incomeRanges[2], Icon: Coins },
    { value: '30001', label: copy.incomeRanges[3], Icon: HandCoins },
  ];
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const sessionIdRef = useRef(sessionId);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: copy.greeting },
    { role: 'assistant', text: copy.age },
  ]);
  const [input, setInput] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [eligible, setEligible] = useState(null);
  const [busy, setBusy] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [speechSupported] = useState(isSpeechRecognitionSupported);
  const pictureField = progress < 17 ? 'age' : progress < 50 ? 'district' : progress < 100 ? 'income' : null;
  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy, result]);

  useEffect(() => () => stopListening(), []);

  async function submit(text, targetSessionId = sessionIdRef.current) {
    if (!text.trim()) return;
    setInput('');
    setError('');
    setMessages((current) => [...current, { role: 'user', text }]);
    setBusy(true);
    try {
      const response = await sendMessage(targetSessionId, text, language);
      setMessages((current) => [...current, { role: 'assistant', text: response.reply }]);
      setProgress(response.progress);
      if (response.completed) setEligible(response.eligible);
      if (response.result) setResult(response.result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitMessage(event) {
    event?.preventDefault();
    if (busy || demoRunning || result || !input.trim()) return;
    await submit(input.trim());
  }

  function toggleVoice() {
    if (busy || demoRunning || result) return;
    if (listening) {
      stopListening();
      setListening(false);
      return;
    }
    const started = startListening(
      (transcript) => setInput((current) => `${current}${current ? ' ' : ''}${transcript}`),
      copy.locale,
      () => setListening(false),
      () => setListening(false),
    );
    if (started) setListening(true);
  }

  async function startOver() {
    let nextSessionId = crypto.randomUUID();
    try {
      const response = await resetSession(sessionId);
      nextSessionId = response.sessionId || nextSessionId;
    } catch { /* A new session can still begin offline. */ }
    sessionIdRef.current = nextSessionId;
    setSessionId(nextSessionId);
    setMessages([{ role: 'assistant', text: copy.greeting }, { role: 'assistant', text: copy.age }]);
    setInput('');
    setProgress(0);
    setResult(null);
    setEligible(null);
    setError('');
    return nextSessionId;
  }

  async function runDemo() {
    if (busy || demoRunning) return;
    setDemoRunning(true);
    try {
      await startOver();
      for (const item of demoData) {
        await submit(item);
      }
    } finally {
      setDemoRunning(false);
    }
  }

  function repeatLastPrompt() {
    const lastAssistantMessage = [...messages].reverse().find((message) => message.role === 'assistant');
    if (lastAssistantMessage) speakText(lastAssistantMessage.text, copy.locale);
  }

  function answerUnknown() {
    if (busy || demoRunning || result) return;
    void submit('எனக்கு தெரியாது');
  }

  async function changeLanguage(event) {
    const nextLanguage = event.target.value;
    const nextCopy = LANGUAGES[nextLanguage];
    setLanguage(nextLanguage);
    localStorage.setItem('sakhi-language', nextLanguage);

    if (result) return;
    if (messages.length === 2 && progress === 0) {
      setMessages([{ role: 'assistant', text: nextCopy.greeting }, { role: 'assistant', text: nextCopy.age }]);
      return;
    }

    try {
      const response = await sendMessage(sessionId, 'REPEAT', nextLanguage);
      setMessages((current) => [...current, { role: 'assistant', text: response.reply }]);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="app-shell" id="home">
      <Header onStartOver={startOver} />
      <main className="main-layout">
        <section className="conversation-column" aria-label="Sakhi scheme assistant">
          <div className="hero">
            <h1>SAKHI</h1>
            <p>{copy.greeting}</p>
            <label className="language-picker">
              <Languages size={18} aria-hidden="true" />
              <span>Language</span>
              <select value={language} onChange={changeLanguage} disabled={demoRunning} aria-label="Select language">
                {Object.entries(LANGUAGES).map(([code, option]) => <option value={code} key={code}>{option.name}</option>)}
              </select>
            </label>
            <div className="hero-actions">
              <button className="hero-action hero-action-primary" type="button" onClick={toggleVoice} disabled={!speechSupported || busy || demoRunning || Boolean(result)}><Mic size={17} />{copy.voice}</button>
              <button className="hero-action" type="button" onClick={() => inputRef.current?.focus()} disabled={busy || demoRunning || Boolean(result)}><Keyboard size={17} />{copy.type}</button>
              <button className="hero-action" type="button" onClick={answerUnknown} disabled={busy || demoRunning || Boolean(result)}><CircleHelp size={17} />{copy.unknown}</button>
              <button className="hero-action" type="button" onClick={repeatLastPrompt}><RotateCcw size={17} />{copy.repeat}</button>
              <button className="hero-action hero-action-demo" type="button" onClick={runDemo} disabled={busy || demoRunning}><Play size={16} />{demoRunning ? '...' : copy.demo}</button>
            </div>
          </div>
          <div className="conversation-frame">
            <div className="conversation-header">
              <div className="assistant-status"><span className="status-light" /><span>Sakhi assistant</span></div>
              <span className="conversation-language">EN <span>·</span> भारत</span>
            </div>
            <div className="message-list" role="log" aria-live="polite" aria-relevant="additions">
              {messages.map((message, index) => <ChatBubble key={`${index}-${message.role}`} message={message} locale={copy.locale} />)}
              {pictureField && pictureField !== 'district' && <div className="picture-selector" aria-label={copy.pictureHint}>
                <p>{copy.pictureHint}</p>
                <div className="picture-choice-grid">
                  {(pictureField === 'age' ? ageChoices : incomeChoices).map(({ value, label, Icon }) => (
                    <button className="picture-choice" type="button" key={value} onClick={() => void submit(value)} disabled={busy || demoRunning}>
                      <Icon size={30} strokeWidth={1.7} aria-hidden="true" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>}
              {busy && <div className="typing-indicator"><span /><span /><span /><span className="sr-only">Sakhi is thinking</span></div>}
              <div ref={endRef} />
            </div>
            {error && <p className="error-message" role="alert">{error}</p>}
            {!result && <form className="composer" onSubmit={submitMessage}>
              <label className="sr-only" htmlFor="answer">Your answer</label>
              <input ref={inputRef} id="answer" value={input} onChange={(event) => setInput(event.target.value)} placeholder={copy.placeholder} disabled={busy || demoRunning} autoComplete="off" />
              <div className="composer-actions">
                <VoiceButton listening={listening} supported={speechSupported} onClick={toggleVoice} />
                <button className="send-button" type="submit" disabled={!input.trim() || busy || demoRunning} aria-label="Send answer" title="Send answer">{busy ? <LoaderCircle size={18} className="spin" /> : <ArrowUp size={19} />}</button>
              </div>
            </form>}
            {!result && <div className="composer-hint"><Sparkles size={13} /> No documents or personal ID needed</div>}
          </div>
          {result && <div className={`eligibility-card ${eligible ? 'success-card' : 'warning-card'}`} role="status">
            {eligible
              ? <><BadgeCheck size={22} /><p>{copy.success}</p></>
              : <><CircleAlert size={22} /><p>{copy.warning}</p></>}
          </div>}
          {result && <ResultCard result={result} onRestart={startOver} copy={copy} />}
          <div className="below-note"><CircleHelp size={15} /><span>Free to use · No sign-up · Answers are kept for this chat only</span></div>
        </section>
        <ProgressCard progress={progress} />
      </main>
      <footer className="site-footer" id="about"><span>© 2026 Sakhi</span><span>Made to make support easier to find.</span><a href="#how-it-works">How Sakhi works</a></footer>
      <span className="sr-only" id="how-it-works">Sakhi asks a few questions and compares your answers with scheme information.</span>
    </div>
  );
}