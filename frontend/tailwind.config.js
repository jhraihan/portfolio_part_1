/** @type {import('tailwindcss').Config} */

// The palette is defined once here and consumed everywhere as semantic tokens.
// Light and dark values are supplied as CSS custom properties in index.css so
// a theme switch never requires touching a component.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Surfaces, from the page background outward.
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        elevated: 'rgb(var(--elevated) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        'line-strong': 'rgb(var(--line-strong) / <alpha-value>)',

        // Text, by descending emphasis.
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--ink-muted) / <alpha-value>)',
        'ink-faint': 'rgb(var(--ink-faint) / <alpha-value>)',

        // The single accent, used sparingly.
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover) / <alpha-value>)',
        },

        // Secondary hues for syntax-style category tinting only.
        cyan: 'rgb(var(--cyan) / <alpha-value>)',
        amber: 'rgb(var(--amber) / <alpha-value>)',
        violet: 'rgb(var(--violet) / <alpha-value>)',
        green: 'rgb(var(--green) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // A restrained scale. Display sizes clamp so headings never overflow
        // small screens or grow absurd on very wide ones.
        hero: ['clamp(3rem, 7.5vw, 6.5rem)', { lineHeight: '0.98', letterSpacing: '-0.04em' }],
        'display-lg': ['clamp(2.75rem, 6vw, 5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        display: ['clamp(2.25rem, 4.5vw, 3.5rem)', { lineHeight: '1.06', letterSpacing: '-0.025em' }],
        'heading-lg': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        heading: ['clamp(1.375rem, 2vw, 1.75rem)', { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        body: ['1.0625rem', { lineHeight: '1.7' }],
      },
      spacing: {
        section: 'clamp(4.5rem, 10vw, 8.5rem)',
      },
      maxWidth: {
        content: '75rem',
        prose: '44rem',
      },
      borderRadius: {
        card: '0.875rem',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Caret for the typing effect in the hero.
        blink: {
          '0%, 45%': { opacity: '1' },
          '50%, 95%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // Slow drift for the ambient background glows.
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(2%, -3%, 0) scale(1.06)' },
        },
        // Dashed connector flow in the architecture diagrams.
        dash: {
          to: { strokeDashoffset: '-16' },
        },
        // Sweep used on the skeleton loaders.
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        blink: 'blink 1.1s steps(1) infinite',
        drift: 'drift 18s ease-in-out infinite',
        dash: 'dash 1s linear infinite',
        shimmer: 'shimmer 1.8s infinite',
      },
    },
  },
  plugins: [],
}
