import { NextResponse } from 'next/server';
import { notifyNewLead, type EscalationReason, type Lead } from '@/lib/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REASONS: EscalationReason[] = [
  'out-of-scope',
  'existing-customer',
  'telephony-or-account',
  'visitor-requested',
  'unknown',
];

/** Deliberately permissive — the goal is to catch typos, not to police addresses. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!EMAIL.test(email)) {
    return NextResponse.json(
      { error: 'That email address does not look right.' },
      { status: 400 },
    );
  }

  const reason = REASONS.includes(body.reason as EscalationReason)
    ? (body.reason as EscalationReason)
    : 'unknown';

  const lead: Lead = {
    email,
    name: typeof body.name === 'string' ? body.name.trim().slice(0, 120) : undefined,
    question:
      typeof body.question === 'string'
        ? body.question.trim().slice(0, 2000)
        : '(not provided)',
    reason,
    transcript: Array.isArray(body.transcript)
      ? (body.transcript as Lead['transcript'])
          ?.slice(-12)
          .map((t) => ({ role: t.role, content: String(t.content).slice(0, 1000) }))
      : undefined,
    pageUrl:
      typeof body.pageUrl === 'string' ? body.pageUrl.slice(0, 500) : undefined,
  };

  const result = await notifyNewLead(lead);

  // Always 200 to the visitor. notifyNewLead has already logged the full lead
  // server-side, so a transport misconfiguration is recoverable — and telling
  // someone their message failed after they typed it helps nobody.
  return NextResponse.json({ ok: true, delivered: result.ok });
}
