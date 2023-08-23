const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './public/*.html',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js',
    './app/views/**/*.{erb,haml,html,slim}'
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '2rem',
          sm: '3rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      colors: {
        'main-blue': '#223355',
        'main-yellow': '#FFC300',
        'main-light-yellow': '#FFD400'
      },
      fontFamily: {
        body: ['DINRoundPro', 'Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ]
}
