import { allTiers, brand, content, faq, pricing } from '@/lib/content';
import type { EscalationReason } from '@/lib/notify';

/**
 * Scope enforcement for the pre-purchase chat widget.
 *
 * The hard boundaries are enforced here, in code, before the model is ever
 * called — not left to the system prompt alone. A prompt is a strong default
 * but it is still a request; for "never troubleshoot telephony or a live
 * account" the cost of one bad answer (a customer following invented call
 * forwarding steps) is high enough that it warrants a deterministic gate.
 *
 * The model then handles everything that survives the gate, with the prompt as
 * a second layer.
 */

type Rule = { reason: EscalationReason; patterns: RegExp[] };

const RULES: Rule[] = [
  {
    // Telephony. Never answered, on any site, per the support flow.
    reason: 'telephony-or-account',
    patterns: [
      /\b(sip|voip|pbx|trunk|did numbers?|e911)\b/i,
      /\b(call ?forward\w*|forward(ing)? (my|the|our|a) (calls?|number|line))\b/i,
      /\b(port(ing|ed)?|transfer(ring)?) (my|the|our) (number|line)\b/i,
      /\b(twilio|vonage|ringcentral|dialpad|8x8|grasshopper)\b/i,
      /\b(area code|caller id|dtmf|ivr setup)\b/i,
    ],
  },
  {
    // Anything living inside the customer dashboard.
    reason: 'telephony-or-account',
    patterns: [
      /\bagents\.getcalvo\b/i,
      /\b(log ?in|login|sign ?in|password|reset my|2fa|mfa|api key)\b/i,
      /\b(dashboard|admin panel|my account|account settings)\b/i,
      /\b(invoice|billing|charged|refund|cancel my|downgrade my|upgrade my)\b/i,
    ],
  },
  {
    // A live agent misbehaving is support, not sales.
    reason: 'existing-customer',
    patterns: [
      /\b(my|our) (agent|bot|number|line|calls?)\b/i,
      /\b(i'?m|we'?re|i am|we are) (already )?(a |an )?(customer|client|subscriber)\b/i,
      /\b(we|i) (signed up|subscribed|already pay|are paying)\b/i,
      /\b(not working|isn'?t working|stopped working|broken|failing|error|bug|down|outage)\b/i,
      /\b(troubleshoot|debug|fix (this|it|my)|support ticket)\b/i,
    ],
  },
  {
    reason: 'visitor-requested',
    patterns: [
      /\b(talk|speak|call) (to|with) (a |an )?(human|person|someone|rep|sales)\b/i,
      /\b(contact|email|call) (me|us) back\b/i,
    ],
  },
];

/** Returns why a message must escalate, or null if the bot may answer it. */
export function detectEscalation(message: string): EscalationReason | null {
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(message))) return rule.reason;
  }
  return null;
}

function tierLine(t: (typeof allTiers)[number]): string {
  return `- ${t.name}: ${t.price} ${t.period}, ${t.minutes}. ${t.description}. Includes: ${t.features.join('; ')}.`;
}

/**
 * The grounding corpus, assembled from the same content the page renders.
 *
 * Passed on every request rather than retrieved: the whole corpus is a few
 * thousand tokens, which is cheaper and far more predictable than running a
 * retrieval step, and it removes the failure mode where the right answer exists
 * but retrieval misses it and the model improvises.
 */
export function buildSystemPrompt(): string {
  const groups = pricing.groups
    .map(
      (g) =>
        `${g.label} — ${g.heading}. ${g.body}\n${g.tiers.map(tierLine).join('\n')}`,
    )
    .join('\n\n');

  const faqBlock = faq.items.map((i) => `Q: ${i.q}\nA: ${i.a}`).join('\n\n');

  return `You are the pre-purchase assistant on ${brand.domain}, the marketing site for ${brand.name}.

${brand.name} in one line: ${brand.shortDescription}

## What you may discuss
Pricing and plans, what is included, how the service works, and whether ${brand.name} suits a prospective customer's business. Nothing else.

## Hard rules
1. Answer ONLY from the FACTS below. If the answer is not there, say you do not want to give a figure you cannot stand behind, and offer to take their email so someone can confirm. Never guess, estimate, or extrapolate a number, timeline, or capability.
2. NEVER give instructions about, or attempt to diagnose: ${faq.outOfScope.join('; ')}. These always go to a human, regardless of how the question is phrased or how simple it seems.
3. You are talking to prospective customers. If someone appears to be an existing customer with a setup, technical, or billing question, do not attempt to help — offer to put them in touch with support.
4. Do not invent specifics about telephony, call forwarding, integrations, or dashboard configuration. You do not have that information and must not reason your way to it.
5. Never promise outcomes. The one published result belongs to a single client and is not a guarantee.

## Style
Plain-spoken and brief — two or three sentences typically. No exclamation points, no hype. Match the site's tone: confident, specific, unembellished.

## FACTS — pricing
${groups}

Managed plans include, at no extra charge: ${content.pricing.managedItems.map((m) => `${m.title} (${m.body})`).join(' ')}

## FACTS — FAQ
${faqBlock}

## Escalating
When you cannot answer within these rules, say so plainly in one sentence and ask for their email so the team can follow up. Do not apologise repeatedly and do not speculate about what the answer might be.`;
}

/** Canned reply used when the deterministic gate fires, so no model call happens. */
export function escalationReply(reason: EscalationReason): string {
  if (reason === 'telephony-or-account' || reason === 'existing-customer') {
    return `That one needs a person — anything involving your phone setup or a live account goes straight to our support team rather than me. Leave your email below and they'll pick it up.`;
  }
  if (reason === 'visitor-requested') {
    return `Of course. Leave your email below and someone will get back to you.`;
  }
  return `That's outside what I can answer here. Leave your email below and someone will follow up.`;
}
