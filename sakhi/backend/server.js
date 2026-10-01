import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { v4 as uuid } from 'uuid';
import { evaluateEligibility } from './services/eligibility.js';
import { getLanguageMessages } from './services/languages.js';
import sessions, { clearSession, FLOW, QUESTIONS } from './services/sessionStore.js';

const app = express();
const port = Number(process.env.PORT || 5001);
const dataUrl = new URL('./data/scheme.json', import.meta.url);
const schemes = JSON.parse(await readFile(fileURLToPath(dataUrl), 'utf8'));

app.use(cors());
app.use(express.json({ limit: '8kb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/schemes', (_req, res) => res.json({ schemes: schemes.map(({ rules, ...scheme }) => scheme) }));

app.post('/api/chat', (req, res) => {
  const { sessionId: requestedSessionId, message, text, language: requestedLanguage } = req.body || {};
  const userMessage = message ?? text;
  if (
    (requestedSessionId !== undefined && (typeof requestedSessionId !== 'string' || requestedSessionId.length > 100)) ||
    typeof userMessage !== 'string' ||
    !userMessage.trim() ||
    userMessage.length > 1000
  ) {
    return res.status(400).json({ error: 'Please send a short answer to continue.' });
  }

  const sessionId = requestedSessionId || uuid();
  const session = getOrCreateSession(sessionId);
  const language = getLanguageMessages(requestedLanguage);
  const currentField = FLOW[session.step];

  if (!currentField) {
    return res.json(createCompletion(sessionId, session, language));
  }

  if (userMessage.trim().toUpperCase() === 'REPEAT') {
    return res.json({
      sessionId,
      completed: false,
      reply: language.questions[currentField] || QUESTIONS[currentField],
      progress: Math.round((session.step / FLOW.length) * 100),
      totalSteps: FLOW.length,
    });
  }

  if (userMessage.trim() === 'IDONTKNOW') {
    return res.json({
      sessionId,
      completed: false,
      reply: language.unknown,
      progress: Math.round((session.step / FLOW.length) * 100),
      totalSteps: FLOW.length,
    });
  }

  const isUnknown = isUnknownAnswer(userMessage);
  const value = isUnknown ? null : parseField(currentField, userMessage);
  if (value === null && !isUnknown) {
    return res.json({
      sessionId,
      completed: false,
      reply: language.invalid[currentField],
      progress: Math.round((session.step / FLOW.length) * 100),
      totalSteps: FLOW.length,
    });
  }

  session.data[currentField] = value;
  session.step += 1;

  if (session.step >= FLOW.length) {
    return res.json(createCompletion(sessionId, session, language));
  }

  return res.json({
    sessionId,
    completed: false,
    reply: language.questions[FLOW[session.step]] || QUESTIONS[FLOW[session.step]],
    progress: Math.round((session.step / FLOW.length) * 100),
    totalSteps: FLOW.length,
  });
});

app.post('/api/reset', (_req, res) => {
  const sessionId = uuid();
  getOrCreateSession(sessionId);
  res.json({ sessionId });
});

app.post('/api/session/reset', (req, res) => {
  const sessionId = req.body?.sessionId;
  if (typeof sessionId === 'string') clearSession(sessionId);
  res.json({ ok: true });
});

app.listen(port, () => console.log(`Sakhi API listening on http://localhost:${port}`));

function getOrCreateSession(sessionId) {
  if (!Object.hasOwn(sessions, sessionId)) {
    Object.defineProperty(sessions, sessionId, {
      value: { step: 0, data: {} },
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
  return sessions[sessionId];
}

function parseField(field, message) {
  if (field === 'age') {
    const age = Number.parseInt(message, 10);
    return Number.isInteger(age) && age >= 13 && age <= 110 ? age : null;
  }
  if (field === 'district') return message.trim().slice(0, 80) || null;
  if (field === 'income') {
    const income = Number.parseInt(message.replace(/\D/g, ''), 10);
    return Number.isSafeInteger(income) && income > 0 ? income : null;
  }
  return null;
}

function createCompletion(sessionId, session, language) {
  const eligible = evaluateEligibility(session.data);
  const pmmvy = schemes.find(({ id }) => id === 'pmmvy');
  const matchedSchemes = eligible && pmmvy ? [{
    ...pmmvy,
    matchReason: language.matchReason,
  }] : [];

  return {
    sessionId,
    completed: true,
    eligible,
    data: session.data,
    reply: eligible === true
      ? language.eligible
      : eligible === false
        ? language.ineligible
        : language.undetermined,
    progress: 100,
    totalSteps: FLOW.length,
    result: {
      schemes: matchedSchemes,
      exploreSchemes: schemes.filter(({ id }) => !matchedSchemes.some((match) => match.id === id)),
    },
  };
}

function isUnknownAnswer(message) {
  const normalized = message.trim().toLowerCase();
  const compact = normalized.replace(/[\s_-]/g, '');
  return normalized.includes('எனக்கு தெரியாது') || normalized === 'தெரியாது' || normalized === "don't know" || normalized === 'not sure' || compact === 'idontknow';
}
