import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        classic: '#FF6B9D',
        vegetarian: '#4ADE80',
        sweet: '#FBBF24',
        keto: '#8B5CF6'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-subtle': 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)',
        'gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      },
      borderRadius: {
        'bubble': '2rem',
        'mega': '3rem'
      },
      boxShadow: {
        'bubble': '0 8px 16px -4px rgba(59, 130, 246, 0.3)',
        'bubble-lg': '0 12px 24px -8px rgba(59, 130, 246, 0.4)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
      },
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        grazey: {
          "primary": "#2563eb",         // Stronger blue (was #3b82f6)
          "primary-focus": "#1d4ed8",   // Darker blue for hover
          "primary-content": "#ffffff", // White text on primary
          "secondary": "#0891b2",       // Stronger cyan
          "accent": "#0284c7",          // Stronger sky blue
          "neutral": "#1e293b",         // Darker slate
          "base-100": "#ffffff",        // White base
          "base-200": "#f1f5f9",        // Slightly stronger blue-gray
          "base-300": "#e2e8f0",        // More visible borders
          "base-content": "#1e293b",    // Darker text for contrast
          "info": "#0284c7",            // Stronger sky blue
          "success": "#059669",         // Stronger emerald
          "warning": "#d97706",         // Stronger amber
          "error": "#dc2626",           // Stronger red
        }
      }
    ]
  }
};

export default config;
