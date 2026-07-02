/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    // Override the built-in gray scale with warm tones from the design tokens
    // so existing bg-gray-*, text-gray-*, border-gray-* classes pick up the new palette
    colors: {
      transparent: 'transparent',
      current:     'currentColor',
      white: '#ffffff',
      black: '#000000',

      // Warm gray — replaces default cool Tailwind gray
      gray: {
        50:  '#faf9f5',
        100: '#f5f4ef',
        200: '#ede9de',
        300: '#dad9d4',
        400: '#b4b2a7',
        500: '#8a8880',
        600: '#6e6d68',
        700: '#535146',
        800: '#3d3929',
        900: '#28261b',
        950: '#141413',
      },

      // Primary — forest green #2f7f33
      primary: {
        50:  '#f0fdf1',
        100: '#dcfce0',
        200: '#bbf7c1',
        300: '#86efac',
        400: '#4ade6a',
        500: '#2f7f33',
        600: '#28702c',
        700: '#1f5c23',
        800: '#1a4b1d',
        900: '#143d17',
        950: '#0a2409',
      },

      // Accent — warm amber (CTAs, highlights)
      accent: {
        50:  '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
      },

      // Emerald — keep for any existing emerald-* classes
      emerald: {
        50:  '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        950: '#052e16',
      },

      // Red — keep for errors/destructive
      red: {
        50:  '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      },

      // Violet — keep for AI tip feature
      violet: {
        50:  '#f5f3ff',
        100: '#ede9fe',
        200: '#ddd6fe',
        300: '#c4b5fd',
        400: '#a78bfa',
        500: '#8b5cf6',
        600: '#7c3aed',
        700: '#6d28d9',
        800: '#5b21b6',
        900: '#4c1d95',
      },

      // Amber — alias for accent
      amber: {
        50:  '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
      },
    },

    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border:     'var(--border)',
        ring:       'var(--ring)',
        card: {
          DEFAULT:    'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT:    'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        muted: {
          DEFAULT:    'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        secondary: {
          DEFAULT:    'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT:    'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
      },

      fontFamily: {
        sans:    ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['Geist Mono', 'ui-monospace', 'monospace'],
      },

      borderRadius: {
        DEFAULT: '1rem',
        sm:  '0.75rem',
        md:  '0.875rem',
        lg:  '1rem',
        xl:  '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },

      boxShadow: {
        'card':        '0 1px 3px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.07)',
        'card-hover':  '0 4px 12px rgba(0,0,0,.07), 0 16px 40px rgba(0,0,0,.10)',
        'glow-green':  '0 0 0 3px rgba(47,127,51,.3)',
        'glow-amber':  '0 0 0 3px rgba(245,158,11,.3)',
      },

      backgroundImage: {
        'hero-gradient':      'linear-gradient(135deg, #143d17 0%, #1f5c23 40%, #2f7f33 70%, #4ade6a 100%)',
        'hero-gradient-dark': 'linear-gradient(135deg, #0a2409 0%, #143d17 50%, #1a4b1d 100%)',
        'card-overlay':       'linear-gradient(to top, rgba(10,36,9,.85) 0%, rgba(10,36,9,.3) 50%, transparent 100%)',
        'accent-gradient':    'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      },

      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'float':      'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 0 0 rgba(47,127,51,.4)' }, '50%': { boxShadow: '0 0 0 12px rgba(47,127,51,0)' } },
      },
    },
  },
  plugins: [],
};
