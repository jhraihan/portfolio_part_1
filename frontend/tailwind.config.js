/** @type {import('tailwindcss').Config} */

// The palette is defined once in index.css as CSS custom properties and
// consumed here as semantic tokens, so a theme switch never requires touching
// a component.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        elevated: 'rgb(var(--elevated) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        'line-strong': 'rgb(var(--line-strong) / <alpha-value>)',

        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--ink-muted) / <alpha-value>)',
        'ink-faint': 'rgb(var(--ink-faint) / <alpha-value>)',

        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover) / <alpha-value>)',
          deep: 'rgb(var(--accent-deep) / <alpha-value>)',
        },
        'on-accent': 'rgb(var(--on-accent) / <alpha-value>)',

        violet: 'rgb(var(--violet) / <alpha-value>)',
        amber: 'rgb(var(--amber) / <alpha-value>)',
        green: 'rgb(var(--green) / <alpha-value>)',
        pink: 'rgb(var(--pink) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Clamped so headings never overflow small screens or grow absurd on
        // very wide ones.
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
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Caret for the hero typing effect.
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
        // Sweep across the skeleton loaders.
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        // Slides the gradient across accent text, so it reads as lit rather
        // than flat.
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% center' },
          '50%': { backgroundPosition: '100% center' },
        },
        // Expanding ring behind the availability dot.
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%, 100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        // Gentle vertical float for the hero portrait frame.
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        // Sheen that sweeps a card once on hover.
        sheen: {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)' },
          '100%': { transform: 'translateX(220%) skewX(-12deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        blink: 'blink 1.1s steps(1) infinite',
        drift: 'drift 18s ease-in-out infinite',
        dash: 'dash 1s linear infinite',
        shimmer: 'shimmer 1.8s infinite',
        'gradient-pan': 'gradient-pan 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        sheen: 'sheen 0.9s ease-out',
      },
    },
  },
  plugins: [],
}
