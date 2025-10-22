/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'player': 'rgb(var(--color-player) / <alpha-value>)',
        'player-icon': 'rgb(var(--color-player-icon) / <alpha-value>)',
        'ally': 'rgb(var(--color-ally) / <alpha-value>)',
        'ally-light': 'rgb(var(--color-ally-light) / <alpha-value>)',
        'monster': 'rgb(var(--color-monster) / <alpha-value>)',
        'monster-light': 'rgb(var(--color-monster-light) / <alpha-value>)',
        'hp': 'rgb(var(--color-hp) / <alpha-value>)',
        'hp-bg': 'rgb(var(--color-hp-bg) / <alpha-value>)',
        'status': 'rgb(var(--color-status) / <alpha-value>)',
        'status-bg': 'rgb(var(--color-status-bg) / <alpha-value>)',
        'initiative-default': 'rgb(var(--color-initiative-default) / <alpha-value>)',
        'card-border': 'rgb(var(--color-card-border) / <alpha-value>)',
        'card-bg': 'rgb(var(--color-card-bg) / <alpha-value>)',
        'card-hover': 'rgb(var(--color-card-hover) / <alpha-value>)',
        'arrow': 'rgb(var(--color-arrow) / <alpha-value>)',
        'arrow-hover': 'rgb(var(--color-arrow-hover) / <alpha-value>)',
        'suggestion-hover': 'rgb(var(--color-suggestion-hover) / <alpha-value>)',
        'tooltip-bg': 'rgb(var(--color-tooltip-bg) / <alpha-value>)',
        'colorpicker-border': 'rgb(var(--color-colorpicker-border) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
