import { NextResponse } from 'next/server';
import {
  buildSystemPrompt,
  detectEscalation,
  escalationReply,
} from '@/lib/chat-scope';
import { SITE_URL } from '@/lib/constants';

export const runtime = 'nodejs';
/** Never cached — every turn is unique and the corpus is built per request. */
export const dynamic = 'force-dynamic';

const MAX_MESSAGE_CHARS = 1000;
const MAX_TURNS = 12;

/**
 * OpenRouter, called over plain fetch.
 *
 * Its API is OpenAI-shaped, so a vendor SDK would buy nothing here beyond a
 * dependency and a version to keep current — this is one POST with a JSON body.
 * Swapping provider later means changing this URL, the header block, and the
 * two lines that read the response.
 */
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Model slug. OpenRouter's catalogue moves, so confirm this against
 * openrouter.ai/models and override with OPENROUTER_MODEL rather than editing
 * code. A small, cheap model is the right default: the bot answers from a fixed
 * corpus and refuses everything else, which is not work that needs a large model.
 */
const MODEL = process.env.OPENROUTER_MODEL ?? 'anthropic/claude-haiku-4.5';

/** A public endpoint must not hang on a slow upstream. */
const UPSTREAM_TIMEOUT_MS = 20_000;

/**
 * Crude per-IP throttle.
 *
 * In-memory, so it resets on cold start and is per-instance rather than global.
 * That makes it a speed bump against casual abuse of a public LLM endpoint, not
 * a real rate limiter — move to a shared store (Upstash/Vercel KV) before this
 * sees meaningful traffic. Called out rather than left to be discovered.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

type Turn = { role: 'user' | 'assistant'; content: string };

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many messages. Give it a minute.' },
      { status: 429 },
    );
  }

  let body: { message?: unknown; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const message =
    typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return NextResponse.json({ error: 'Empty message.' }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json(
      { error: 'That message is too long.' },
      { status: 400 },
    );
  }

  const history: Turn[] = Array.isArray(body.history)
    ? (body.history as Turn[])
        .filter(
          (t) =>
            t &&
            (t.role === 'user' || t.role === 'assistant') &&
            typeof t.content === 'string',
        )
        .slice(-MAX_TURNS)
        .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_MESSAGE_CHARS) }))
    : [];

  // Deterministic gate. Runs before the model so an out-of-scope question
  // cannot be answered even if the model were inclined to try.
  const escalation = detectEscalation(message);
  if (escalation) {
    return NextResponse.json({
      reply: escalationReply(escalation),
      escalate: true,
      reason: escalation,
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    // Degrade to the escalation path rather than erroring at the visitor.
    return NextResponse.json({
      reply: escalationReply('out-of-scope'),
      escalate: true,
      reason: 'out-of-scope',
    });
  }

  try {
    const upstream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // OpenRouter uses these for attribution in its dashboard. Optional,
        // but they make usage legible when several apps share one key.
        'HTTP-Referer': SITE_URL,
        'X-Title': 'Calvo site chat',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        // OpenAI-shaped: the system prompt is the first message rather than a
        // separate top-level field.
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          ...history,
          { role: 'user', content: message },
        ],
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      throw new Error(`OpenRouter ${upstream.status}: ${detail.slice(0, 300)}`);
    }

    const data = await upstream.json();

    // OpenRouter can return a 200 carrying an error object (bad model slug,
    // no credit), so a successful status is not on its own a successful call.
    if (data?.error) {
      throw new Error(`OpenRouter error: ${JSON.stringify(data.error).slice(0, 300)}`);
    }

    const reply: string =
      typeof data?.choices?.[0]?.message?.content === 'string'
        ? data.choices[0].message.content.trim()
        : '';

    if (!reply) {
      return NextResponse.json({
        reply: escalationReply('out-of-scope'),
        escalate: true,
        reason: 'out-of-scope',
      });
    }

    return NextResponse.json({ reply, escalate: false });
  } catch (err) {
    console.error('[chat] model call failed:', err);
    // A provider outage becomes a lead-capture opportunity, not a dead widget.
    return NextResponse.json({
      reply: `I can't reach my notes right now. Leave your email below and someone will follow up.`,
      escalate: true,
      reason: 'unknown',
    });
  }
}
