/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },

      // SEMANTIC COLOR PALETTE - Soft Matte (Zinc & Indigo)
      colors: {
        // Backgrounds
        background: '#09090b',        // zinc-950 - Deepest matte black/gray

        // Surfaces
        surface: {
          DEFAULT: '#18181b',         // zinc-900 - Cards, Sidebars
          highlight: '#27272a',       // zinc-800 - Hover states, Inputs
        },

        // Borders
        border: '#27272a',            // zinc-800 - Subtle dividers

        // Text
        'text-main': '#f4f4f5',       // zinc-100 - High readability
        'text-muted': '#a1a1aa',      // zinc-400 - Secondary labels

        // Primary (Indigo)
        primary: {
          DEFAULT: '#6366f1',         // indigo-500 - Action buttons, active states
          hover: '#818cf8',           // indigo-400 - Hover state
          muted: '#4f46e5',           // indigo-600 - Pressed state
        },

        // Status Colors
        success: {
          DEFAULT: '#10b981',         // emerald-500
          muted: '#059669',           // emerald-600
        },
        error: {
          DEFAULT: '#f43f5e',         // rose-500
          muted: '#e11d48',           // rose-600
        },
        warning: {
          DEFAULT: '#f59e0b',         // amber-500
          muted: '#d97706',           // amber-600
        },
      },

      // Box Shadows - Subtle and soft
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
        'soft-md': '0 4px 16px -4px rgba(0, 0, 0, 0.4)',
        'soft-lg': '0 8px 24px -6px rgba(0, 0, 0, 0.5)',
      },

      // Animations
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
