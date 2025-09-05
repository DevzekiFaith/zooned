/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
      },
      boxShadow: {
        // Light mode neumorphism
        'neumorph-sm': '5px 5px 10px #d1d5db, -5px -5px 10px #ffffff',
        'neumorph': '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
        'neumorph-lg': '12px 12px 24px #cbd5e1, -12px -12px 24px #ffffff',
        'neumorph-inset': 'inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff',
        
        // Dark mode neumorphism
        'dark-neumorph-sm': '5px 5px 10px #0f172a, -5px -5px 10px #1e293b',
        'dark-neumorph': '8px 8px 16px #0f172a, -8px -8px 16px #1e293b',
        'dark-neumorph-lg': '12px 12px 24px #0f172a, -12px -12px 24px #1e293b',
        'dark-neumorph-inset': 'inset 4px 4px 8px #0f172a, inset -4px -4px 8px #1e293b',
      },
      backgroundColor: {
        'neumorph': 'linear-gradient(145deg, #e2e8f0, #ffffff)',
        'dark-neumorph': 'linear-gradient(145deg, #1e293b, #0f172a)',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'blob2': 'blob2 9s infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(20px, -20px) scale(1.05)' },
          '50%': { transform: 'translate(0, 20px) scale(0.95)' },
          '75%': { transform: 'translate(-20px, -10px) scale(1.02)' },
        },
        blob2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(-20px, 20px) scale(1.05)' },
          '50%': { transform: 'translate(0, -20px) scale(0.95)' },
          '75%': { transform: 'translate(20px, 10px) scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      boxShadow: {
        'neumorph-sm': '5px 5px 10px #d1d5db, -5px -5px 10px #ffffff',
        'neumorph': '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
        'neumorph-lg': '12px 12px 24px #cbd5e1, -12px -12px 24px #ffffff',
        'neumorph-dark-sm': '5px 5px 10px #0f172a, -5px -5px 10px #1e293b',
        'neumorph-dark': '8px 8px 16px #0f172a, -8px -8px 16px #1e293b',
        'neumorph-dark-lg': '12px 12px 24px #0f172a, -12px -12px 24px #1e293b',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glass-dark': '0 4px 30px rgba(0, 0, 0, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '20px',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'glass-dark-gradient': 'linear-gradient(135deg, rgba(30, 41, 59, 0.2), rgba(15, 23, 42, 0.3))',
        'primary-gradient': 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
        'secondary-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/typography')({
      className: 'prose',
    }),
  ],
}
