'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { brand, faq } from '@/lib/content';
import Button from '@/components/ui/Button';

type Turn = { role: 'user' | 'assistant'; content: string };
type Reason = string;

const OPENER: Turn = {
  role: 'assistant',
  content: `Ask me anything about pricing, what's included, or whether ${brand.name} fits your business. For anything about a live account I'll put you in touch with someone.`,
};

/** Shown as tappable starters — pulled from the FAQ so they always have answers. */
const SUGGESTIONS = faq.items.slice(0, 3).map((i) => i.q);

/**
 * Pre-purchase chat widget.
 *
 * Scope is enforced server-side (lib/chat-scope.ts) — this component only
 * renders. When the server flags `escalate`, the composer is replaced by an
 * email capture form rather than letting the visitor keep asking a question the
 * bot has already declined to answer.
 *
 * Styling reuses the existing tokens and Button component; no new design
 * patterns are introduced.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([OPENER]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [escalation, setEscalation] = useState<Reason | null>(null);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [turns, escalation, sent]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || busy) return;

      setError(null);
      setInput('');
      const history = turns.filter((t) => t !== OPENER);
      setTurns((prev) => [...prev, { role: 'user', content: question }]);
      setBusy(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: question, history }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? 'Something went wrong.');
          return;
        }

        setTurns((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        if (data.escalate) setEscalation(data.reason ?? 'unknown');
      } catch {
        setError('Could not reach the server. Try again in a moment.');
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, turns],
  );

  const submitLead = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (busy) return;
      setBusy(true);
      setError(null);

      const lastQuestion =
        [...turns].reverse().find((t) => t.role === 'user')?.content ?? '';

      try {
        const res = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            question: lastQuestion,
            reason: escalation,
            transcript: turns.filter((t) => t !== OPENER),
            pageUrl: window.location.href,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Could not send that.');
          return;
        }
        setSent(true);
      } catch {
        setError('Could not reach the server. Try again in a moment.');
      } finally {
        setBusy(false);
      }
    },
    [busy, email, escalation, turns],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="calvo-chat-panel"
        className="fixed bottom-5 right-5 z-[70] flex h-14 items-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--ink)] px-5 text-[0.9rem] font-medium text-[var(--paper)] shadow-[0_18px_40px_-18px_rgba(11,14,17,0.7)] transition-transform duration-fast ease-out-expo hover:-translate-y-[2px] motion-reduce:transition-none motion-reduce:hover:transform-none"
      >
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full bg-[var(--accent-on-ink)]"
        />
        {open ? 'Close' : 'Questions?'}
      </button>

      <div
        id="calvo-chat-panel"
        ref={panelRef}
        role="dialog"
        aria-label={`${brand.name} pre-sales chat`}
        inert={!open}
        className={[
          'surface-ink fixed bottom-24 right-5 z-[70] flex w-[min(24rem,calc(100vw-2.5rem))] flex-col',
          'overflow-hidden rounded-2xl border border-[var(--line)] shadow-[0_30px_80px_-30px_rgba(11,14,17,0.8)]',
          'transition-[opacity,transform] duration-base ease-out-expo motion-reduce:transition-none',
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-3 opacity-0',
        ].join(' ')}
        style={{ maxHeight: 'min(32rem, calc(100vh - 8rem))' }}
      >
        <div className="flex-none border-b border-[var(--line)] px-5 py-4">
          <p className="eyebrow">{brand.name}</p>
          <p className="mt-1 text-[0.85rem] text-[var(--muted)]">
            Pricing and product questions
          </p>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="flex flex-col gap-3.5">
            {turns.map((turn, i) => (
              <li
                key={i}
                className={turn.role === 'user' ? 'flex justify-end' : ''}
              >
                <p
                  className={[
                    'max-w-[85%] rounded-xl px-3.5 py-2.5 text-[0.9rem] leading-relaxed',
                    turn.role === 'user'
                      ? 'bg-[var(--accent-on-ink)] text-[var(--ink)]'
                      : 'bg-[var(--panel)] text-[var(--fg)]',
                  ].join(' ')}
                >
                  {turn.content}
                </p>
              </li>
            ))}
            {busy && (
              <li>
                <p className="text-[0.85rem] text-[var(--muted)]">Thinking…</p>
              </li>
            )}
          </ul>

          {turns.length === 1 && !escalation && (
            <ul className="mt-4 flex flex-col items-start gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-[var(--line)] px-3 py-1.5 text-left text-[0.82rem] text-[var(--muted)] transition-colors duration-fast hover:border-[var(--fg)] hover:text-[var(--fg)]"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p role="alert" className="mt-3 text-[0.82rem] text-[var(--accent-on-ink)]">
              {error}
            </p>
          )}
        </div>

        <div className="flex-none border-t border-[var(--line)] p-4">
          {sent ? (
            <p className="text-[0.88rem] text-[var(--muted)]">
              Thanks — someone will be in touch by email.
            </p>
          ) : escalation ? (
            <form onSubmit={submitLead} className="flex flex-col gap-2.5">
              <label htmlFor="calvo-chat-email" className="sr-only">
                Your email address
              </label>
              <input
                id="calvo-chat-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-full border border-[var(--line)] bg-transparent px-4 py-2.5 text-[0.9rem] text-[var(--fg)] placeholder:text-[var(--muted)] focus-visible:border-[var(--accent-fg)]"
              />
              <Button type="submit" variant="primary" className="w-full !py-2.5">
                {busy ? 'Sending…' : 'Send'}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <label htmlFor="calvo-chat-input" className="sr-only">
                Your question
              </label>
              <input
                id="calvo-chat-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about pricing…"
                maxLength={1000}
                className="w-full flex-1 rounded-full border border-[var(--line)] bg-transparent px-4 py-2.5 text-[0.9rem] text-[var(--fg)] placeholder:text-[var(--muted)] focus-visible:border-[var(--accent-fg)]"
              />
              <Button
                type="submit"
                variant="primary"
                className="!px-4 !py-2.5 text-[0.85rem]"
              >
                Ask
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatWidget;
