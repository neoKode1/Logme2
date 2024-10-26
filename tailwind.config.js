module.exports = {
  content: ["./src/main/webapp/**/*.{html,js}"],
  theme: {
    extend: {
      scale: {
        '102': '1.02',
      },
      textShadow: {
        'lg': '3px 3px 6px rgba(0, 0, 0, 0.8)',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
