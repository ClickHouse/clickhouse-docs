module.exports = {
    darkMode: 'class',
    plugins: [
      require('@tailwindcss/typography')
    ],
    content: [
      './src/**/*.{js,ts,jsx,tsx}',
    ],
    safelist: ['py-[6px]', 'py-[1px]'],
    theme: {
      screens: {
        print: {
          raw: 'print'
        },
        sm: '640px',
        'sm-mid': '704px',
        md: '768px',
        'md-mid': '896px',
        lg: '1024px',
        'lg-mid': '1152px',
        xl: '1280px',
        'xl-mid': '1408px',
        '2xl': '1536px',
        '3xl': '2200px'
      },
    }
  }
  