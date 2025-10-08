/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  // --- INICIO DE LA CORRECCIÓN ---
  // Apuntamos a las carpetas correctas en la raíz del proyecto
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
  ],
  // --- FIN DE LA CORRECCIÓN ---
  theme: {
    extend: {
        colors: {
            primary: {
                50: '#fdf2f8',
                100: '#fce7f3',
                200: '#fbcfe8',
                300: '#f9a8d4',
                400: '#f472b6',
                500: '#ec4899',
                600: '#db2777',
                700: '#be185d',
            },
            secondary: {
                50: '#f0f9ff',
                100: '#e0f2fe',
                200: '#bae6fd',
                300: '#7dd3fc',
                400: '#38bdf8',
                500: '#0ea5e9',
                600: '#0284c7',
            },
            accent: {
                500: '#fbbf24',
            },
            neutral: {
                50: '#fafafa',
                100: '#f5f5f5',
                200: '#e5e5e5',
                300: '#d4d4d4',
                400: '#a3a3a3',
                500: '#737373',
                600: '#525252',
                700: '#404040',
                800: '#262626',
                900: '#171717',
            },
        },
        fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
        },
        borderRadius: {
            'xl': '1rem',
            '2xl': '1.5rem',
        },
        boxShadow: {
            'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
            'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        },
        keyframes: {
            fadeIn: {
                '0%': { opacity: '0' },
                '100%': { opacity: '1' },
            },
            scaleIn: {
                '0%': { opacity: '0', transform: 'scale(0.95)' },
                '100%': { opacity: '1', transform: 'scale(1)' },
            }
        },
        animation: {
            'fade-in': 'fadeIn 0.3s ease-out',
            'scale-in': 'scaleIn 0.2s ease-out',
        }
    },
  },
  plugins: [],
}