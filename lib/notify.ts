import 'server-only';

/**
 * Outbound notification for a captured lead.
 *
 * THIS FILE IS THE SWAP POINT. Everything upstream calls `notifyNewLead` and
 * knows nothing about how delivery happens. Moving from a personal inbox to a
 * shared support desk, a ticket system, a webhook, or Slack means rewriting
 * `deliver()` below and nothing else — no route handler, component, or caller
 * changes.
 *
 * The destination is never written into code. It comes from NOTIFY_EMAIL, which
 * is read at call time rather than module scope so a platform env change takes
 * effect on the next invocation instead of the next deploy.
 */

export type EscalationReason =
  | 'out-of-scope'
  | 'existing-customer'
  | 'telephony-or-account'
  | 'visitor-requested'
  | 'unknown';

export type Lead = {
  /** Contact address the visitor gave us. */
  email: string;
  name?: string;
  /** What the visitor was asking when the conversation escalated. */
  question: string;
  reason: EscalationReason;
  /** Recent turns, oldest first, for context in the notification. */
  transcript?: { role: 'user' | 'assistant'; content: string }[];
  /** Page the widget was open on. */
  pageUrl?: string;
};

export type NotifyResult = { ok: true } | { ok: false; error: string };

const REASON_LABEL: Record<EscalationReason, string> = {
  'out-of-scope': 'Question outside pre-sales scope',
  'existing-customer': 'Existing customer — needs support, not sales',
  'telephony-or-account': 'Telephony / live account issue — route to support',
  'visitor-requested': 'Visitor asked to speak to someone',
  unknown: 'Uncategorised',
};

function renderBody(lead: Lead): string {
  const lines = [
    `Reason: ${REASON_LABEL[lead.reason]}`,
    `From:   ${lead.name ? `${lead.name} <${lead.email}>` : lead.email}`,
    lead.pageUrl ? `Page:   ${lead.pageUrl}` : null,
    '',
    'Question:',
    lead.question,
  ];

  if (lead.transcript?.length) {
    lines.push('', '--- Conversation ---');
    for (const turn of lead.transcript) {
      lines.push(`${turn.role === 'user' ? 'Visitor' : 'Calvo bot'}: ${turn.content}`);
    }
  }

  return lines.filter((l) => l !== null).join('\n');
}

/**
 * The only transport-aware function in the codebase.
 *
 * Replace the body to change destination system. The contract to keep is:
 * take a Lead, deliver it somewhere durable, resolve — never throw, because a
 * delivery failure must not surface to the visitor as a broken widget.
 */
async function deliver(lead: Lead): Promise<NotifyResult> {
  const to = process.env.NOTIFY_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM_EMAIL;

  if (!to) return { ok: false, error: 'NOTIFY_EMAIL is not set' };
  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY is not set' };
  if (!from) return { ok: false, error: 'NOTIFY_FROM_EMAIL is not set' };

  const { Resend } = await import('resend');
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    to,
    from,
    replyTo: lead.email,
    subject: `[Calvo site] ${REASON_LABEL[lead.reason]} — ${lead.email}`,
    text: renderBody(lead),
  });

  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * Fire a lead notification.
 *
 * Never throws. A failed send is logged server-side and reported to the caller
 * so it can still thank the visitor — losing the notification is bad, but
 * telling someone their message failed after they typed it is worse, and the
 * server log preserves the lead either way.
 */
export async function notifyNewLead(lead: Lead): Promise<NotifyResult> {
  try {
    const result = await deliver(lead);
    if (!result.ok) {
      // Logged in full so the lead is recoverable from platform logs even when
      // the transport is misconfigured.
      console.error('[notify] delivery failed:', result.error, renderBody(lead));
    }
    return result;
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('[notify] threw:', error, renderBody(lead));
    return { ok: false, error };
  }
}
