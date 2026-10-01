import schemeData from '../data/scheme.json' assert { type: 'json' };

const pmmvyScheme = schemeData.find(({ id }) => id === 'pmmvy');

export function evaluateEligibility(state) {
  const income = state.monthlyIncome ?? state.income;
  if (!state.age || !income || !pmmvyScheme?.eligibility) {
    return null;
  }

  return (
    state.age >= pmmvyScheme.eligibility.minAge &&
    income <= pmmvyScheme.eligibility.maxMonthlyIncome
  );
}

export function findMatches(answers, schemes) {
  return schemes.flatMap((scheme) => {
    const rules = scheme.rules;
    const eligibility = scheme.eligibility || {};
    if (scheme.id === 'pmmvy' && evaluateEligibility(answers) !== true) return [];
    if (rules.woman && answers.woman !== true) return [];
    if (rules.minAge && !(answers.age >= rules.minAge)) return [];
    if (rules.maxAge && !(answers.age <= rules.maxAge)) return [];
    if (rules.noLpg && answers.noLpg !== true) return [];
    if (rules.pregnantOrNewborn && answers.pregnantOrNewborn !== true) return [];
    if (rules.shgMember && answers.shgMember !== true) return [];
    if (rules.girlChildUnder10 && answers.girlChildUnder10 !== true) return [];
    return [{ ...scheme, matchReason: personalizedReason(scheme.id, answers) }];
  });
}

function personalizedReason(id, answers) {
  if (id === 'ujjwala') return `You said you are a woman aged ${answers.age} and your household does not have an LPG connection. Income and household eligibility still need to be confirmed.`;
  if (id === 'pmmvy') return 'You said you are pregnant or caring for a baby under six months. Check the current registration window and exclusions with your local Anganwadi centre.';
  if (id === 'lakhpati-didi') return 'You said you are part of a Self-Help Group. Ask your SHG or the local rural livelihoods mission about available training and support.';
  return 'You said you have a girl child under 10. A parent or guardian can ask a participating bank or post office about opening an account.';
}