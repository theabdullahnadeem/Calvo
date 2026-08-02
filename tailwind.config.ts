import type { Config } from 'tailwindcss';

/**
 * Every value here points at a CSS custom property defined in styles/tokens.css.
 * Tailwind is the ergonomics layer; tokens.css is the source of truth. Changing a
 * brand value (notably --accent, which is still a placeholder) happens in one
 * place and propagates to both utilities and hand-written CSS.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        paper: 'var(--paper)',
        // Semantic aliases — these flip inside .surface-ink / .surface-paper.
        bg: 'var(--bg)',
        fg: 'var(--fg)',
        muted: 'var(--muted)',
        accent: 'var(--accent-fg)',
        line: 'var(--line)',
        panel: 'var(--panel)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'step--1': 'var(--step--1)',
        'step-0': 'var(--step-0)',
        'step-1': 'var(--step-1)',
        'step-2': 'var(--step-2)',
        'step-3': 'var(--step-3)',
        'step-4': 'var(--step-4)',
        'step-5': 'var(--step-5)',
        'step-6': 'var(--step-6)',
      },
      letterSpacing: {
        display: 'var(--tracking-display)',
        mono: 'var(--tracking-mono)',
      },
      lineHeight: {
        display: 'var(--leading-display)',
      },
      spacing: {
        gutter: 'var(--gutter)',
      },
      maxWidth: {
        measure: 'var(--measure)',
        shell: 'var(--max-w)',
      },
      transitionTimingFunction: {
        'out-expo': 'var(--ease-out-expo)',
        'out-quint': 'var(--ease-out-quint)',
        'in-out-soft': 'var(--ease-in-out)',
      },
      transitionDuration: {
        fast: '240ms',
        base: '500ms',
        slow: '900ms',
      },
    },
  },
  plugins: [],
};

export default config;
