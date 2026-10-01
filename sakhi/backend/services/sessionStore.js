const sessions = {};

export default sessions;

export const FLOW = ['age', 'district', 'income'];

export const QUESTIONS = {
  age: 'உங்கள் வயது என்ன?',
  district: 'நீங்கள் எந்த மாவட்டத்தில் வசிக்கிறீர்கள்?',
  income: 'உங்கள் குடும்பத்தின் மாத வருமானம் சுமார் எவ்வளவு?',
};

const flowQuestions = {
  age: { prompt: QUESTIONS.age, parse: parseAge },
  district: { prompt: QUESTIONS.district, parse: parseState },
  income: { prompt: QUESTIONS.income, parse: parseMonthlyIncome },
};

export const questions = [
  ...FLOW.map((key) => ({ key, ...flowQuestions[key] })),
  { key: 'woman', prompt: 'Do you identify as a woman? (Yes or no is fine.)', parse: parseYesNo },
  { key: 'pregnantOrNewborn', prompt: 'Are you currently pregnant, or caring for a baby under six months? (Yes or no)', parse: parseYesNo },
  { key: 'shgMember', prompt: 'Are you a member of a women’s Self-Help Group (SHG)? (Yes or no)', parse: parseYesNo },
  { key: 'noLpg', prompt: 'Does your household not have an LPG gas connection? (Yes or no)', parse: parseYesNo },
  { key: 'girlChildUnder10', prompt: 'Do you have a daughter under 10 years old? (Yes or no)', parse: parseYesNo },
];

export function getSession(id) {
  if (!Object.hasOwn(sessions, id)) {
    Object.defineProperty(sessions, id, {
      value: { index: 0, answers: {} },
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
  return sessions[id];
}

export function clearSession(id) { delete sessions[id]; }

function parseAge(text) {
  const match = text.match(/\b(\d{1,3})\b/);
  if (!match) return null;
  const age = Number(match[1]);
  return age >= 13 && age <= 110 ? age : null;
}

function parseState(text) { return text.trim().slice(0, 80); }

function parseMonthlyIncome(text) {
  const normalized = text.toLowerCase().replace(/[₹,\s]/g, '');
  const amounts = [...normalized.matchAll(/(\d+(?:\.\d+)?)(k|thousand|lakh|lac)?/g)];
  if (!amounts.length) return null;
  const parsedAmounts = amounts.map((match) => {
    const amount = Number(match[1]);
    const unit = match[2];
    if (unit === 'k' || unit === 'thousand') return amount * 1000;
    if (unit === 'lakh' || unit === 'lac') return amount * 100000;
    return amount;
  });
  return Math.max(...parsedAmounts);
}

function parseYesNo(text) {
  const normalized = text.trim().toLowerCase();
  if (/^(yes|y|yeah|yep|sure|i am|i do|correct)\b/.test(normalized)) return true;
  if (/^(no|n|nope|not|i am not|i don't|i do not)\b/.test(normalized)) return false;
  return null;
}