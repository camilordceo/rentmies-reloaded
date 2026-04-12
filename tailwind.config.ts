import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Brand colors
        brand: {
          teal: '#40d99d',
          mint: '#4fffb4',
          'light-gray': '#e5e5e5',
          'medium-gray': '#f0f0f0',
          black: '#1a1a1a',
          muted: '#6b7280',
        },
        // Concierge surface system
        surface: {
          DEFAULT: '#fcf9f8',
          dim: '#dcd9d9',
          bright: '#fcf9f8',
          container: {
            lowest: '#ffffff',
            low: '#f6f3f2',
            DEFAULT: '#f0eded',
            high: '#eae7e7',
            highest: '#e5e2e1',
          },
        },
        'on-surface': {
          DEFAULT: '#1c1b1b',
          variant: '#3c4a42',
        },
        'authority-green': '#006c4a',
        outline: {
          DEFAULT: '#6c7a71',
          variant: '#bbcabf',
        },
        // shadcn/ui semantic tokens mapped to brand
        border: '#e5e5e5',
        input: '#f0f0f0',
        ring: '#40d99d',
        background: '#ffffff',
        foreground: '#1a1a1a',
        primary: {
          DEFAULT: '#40d99d',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f0f0f0',
          foreground: '#1a1a1a',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f8f8f8',
          foreground: '#6b7280',
        },
        accent: {
          DEFAULT: '#4fffb4',
          foreground: '#1a1a1a',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#1a1a1a',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1a1a1a',
        },
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'editorial': '0 32px 64px -12px rgba(28, 27, 27, 0.04)',
        'glow-active': '0 0 20px 2px rgba(64, 217, 157, 0.4)',
        'glow-subtle': '0 0 12px 1px rgba(64, 217, 157, 0.2)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        wave: {
          '0%, 100%': { height: '4px' },
          '50%': { height: '16px' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(64, 217, 157, 0.4)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(64, 217, 157, 0.15)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'wave': 'wave 1.2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
