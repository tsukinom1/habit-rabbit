import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px"
      },
      colors: {
        primary: "#FF6B35",     /* Энергичный оранжевый - мотивация */
        secondary: "#2ECC71",   /* Зеленый роста - прогресс */
        accent: "#F39C12",      /* Теплый желтый - достижения */
        background: "#FAFBFC",  /* Чистый белый */
        text: "#2C3E50",        /* Глубокий синий */
        subtext: "#7F8C8D",     /* Мягкий серый */
        success: "#27AE60",     /* Яркий зеленый */
        error: "#E74C3C",       /* Коралловый красный */
        dark: "#1A202C"        /* Темно-синий */
      },
    },
  },
  plugins: [],
}

export default config




