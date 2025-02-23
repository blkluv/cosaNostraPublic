/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
        "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-color': 'rgba(168,124,85,1)',
        'custom-color2': 'rgba(87,59,49,255)' // Define your custom color here
      },
      fontSize: {
        'xl-1': '1.375rem', // Between xl (1.25rem) and 2xl (1.5rem)
      }
    },
  },
  plugins: [],
}

