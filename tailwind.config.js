module.exports = {
  content: ['./src/**/*.{html,ts}'], // Tell tailwind where the classes are, everything else will be removed (unused css)
  safelist: ['bg-blue-400', 'bg-green-400', 'bg-red-400'],
  theme: {
    extend: {},
  },
  plugins: [],
}
