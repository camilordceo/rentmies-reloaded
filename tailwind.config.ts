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
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
