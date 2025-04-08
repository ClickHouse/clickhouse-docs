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
      extend: {
        typography: ({ theme }) => ({
          neutral: {
            css: {
              '--tw-prose-body': theme('colors.neutral[200]'),
              '--tw-prose-headings': theme('colors.neutral[100]'),
              '--tw-prose-lead': theme('colors.neutral[700]'),
              '--tw-prose-links': theme('colors.primary[300]'),
              '--tw-prose-bold': theme('colors.neutral[200]'),
              '--tw-prose-counters': theme('colors.neutral[200]'),
              '--tw-prose-bullets': theme('colors.neutral[200]'),
              '--tw-prose-hr': theme('colors.neutral[300]'),
              '--tw-prose-quotes': theme('colors.neutral[900]'),
              '--tw-prose-quote-borders': theme('colors.neutral[300]'),
              '--tw-prose-captions': theme('colors.neutral[700]'),
              '--tw-prose-code': theme('colors.neutral[900]'),
              '--tw-prose-pre-code': theme('colors.neutral[100]'),
              '--tw-prose-pre-bg': theme('colors.neutral[900]'),
              '--tw-prose-th-borders': theme('colors.neutral[300]'),
              '--tw-prose-td-borders': theme('colors.neutral[200]'),
              '--tw-prose-invert-body': theme('colors.neutral[200]'),
              '--tw-prose-invert-headings': theme('colors.white'),
              '--tw-prose-invert-lead': theme('colors.neutral[300]'),
              '--tw-prose-invert-links': theme('colors.white'),
              '--tw-prose-invert-bold': theme('colors.white'),
              '--tw-prose-invert-counters': theme('colors.neutral[400]'),
              '--tw-prose-invert-bullets': theme('colors.neutral[600]'),
              '--tw-prose-invert-hr': theme('colors.neutral[700]'),
              '--tw-prose-invert-quotes': theme('colors.neutral[100]'),
              '--tw-prose-invert-quote-borders': theme('colors.neutral[700]'),
              '--tw-prose-invert-captions': theme('colors.neutral[400]'),
              '--tw-prose-invert-code': theme('colors.white'),
              '--tw-prose-invert-pre-code': theme('colors.neutral[300]'),
              '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
              '--tw-prose-invert-th-borders': theme('colors.neutral[600]'),
              '--tw-prose-invert-td-borders': theme('colors.neutral[700]')
            }
          }
        }),
        fontSize: {
          '2.75xl': '1.75rem',
          '5.5xl': '3.5rem',
          '5.5xl': '3.5rem',
          '6.5xl': '4rem',
          '7.5xl': '5.25rem'
        },
        fontFamily: {
          inter: 'var(--font-inter), sans-serif',
          inconsolata: 'var(--font-inconsolata)',
          basier: 'Basier Square, Arial, Helvetica, sans-serif'
        },
        colors: {
          rangitoto: '#28281D',
          'base-color': '#FBFF46',
          'eerie-black': '#1A1918',
          jet: '#343434',
  
          // Generated from:
          // @link https://www.tailwindshades.com/#color=64.70588235294119%2C100%2C50&step-up=8&step-down=11&hue-shift=0&name=ch-yellow&base-stop=5&v=1&overrides=e30%3D
          'ch-yellow': {
            DEFAULT: '#EBFF00',
            50: '#F9FFB8',
            100: '#F8FFA3',
            200: '#F5FF7A',
            300: '#F1FF52',
            400: '#EEFF29',
            500: '#EBFF00',
            600: '#B7C700',
            700: '#848F00',
            800: '#505700',
            900: '#1C1F00',
            950: '#020300'
          },
  
          // Generated from:
          // @link https://www.tailwindshades.com/#color=167.21311475409837%2C100%2C11.96078431372549&step-up=7&step-down=3&hue-shift=0&name=ch-teal&base-stop=6&v=1&overrides=e30%3D
          'ch-teal': {
            DEFAULT: '#003D30',
            50: '#02FFC9',
            100: '#00F0BC',
            200: '#00CCA0',
            300: '#00A884',
            400: '#008468',
            500: '#00614C',
            600: '#003D30',
            700: '#002E24',
            800: '#001E18',
            900: '#000F0C',
            950: '#000706'
          },
          primary: {
            DEFAULT: '#FBFF46',
            50: '#FFFFE8',
            100: '#FEFFBA',
            200: '#FDFFA3',
            300: '#FAFF69',
            400: '#EEF400',
            500: '#9FA300',
            600: '#4F5100',
            700: '#282900',
            800: '#1F2014',
            900: '#161600'
          },
          neutral: {
            DEFAULT: '#212121',
            0: '#FFFFFF',
            100: '#F9F9F9',
            200: '#dfdfdf',
            300: '#c0c0c0',
            400: '#a0a0a0',
            500: '#808080',
            600: '#606060',
            700: '#414141',
            725: '#282828',
            750: '#1F1F1C',
            800: '#1d1d1d',
            900: '#151515'
          },
          slate: {
            DEFAULT: '#373439',
            50: '#F6F7FA',
            100: '#e6e7e9',
            200: '#cccfd3',
            300: '#b3b6bd',
            400: '#9a9ea7',
            500: '#808691',
            600: '#696e79',
            700: '#53575f',
            800: '#302e32',
            900: '#161517'
          },
          indigo: {
            DEFAULT: '#2F2C3A',
            50: '#F4F1FC',
            100: '#e4e2e9',
            200: '#c8c5d3',
            300: '#ada8bd',
            400: '#918ba7',
            500: '#766e91',
            600: '#5e5874',
            700: '#474257',
            800: '#23212c',
            900: '#18161d'
          },
          info: {
            DEFAULT: '#2F2C3A',
            50: '#dae6fc',
            100: '#b5cdf9',
            200: '#91b3f6',
            300: '#6c9af3',
            400: '#135be6',
            500: '#0e44ad',
            600: '#092e73',
            700: '#061d48',
            800: '#05173a',
            900: '#041330'
          },
          success: {
            DEFAULT: '#62DE85',
            50: '#e0f8e7',
            100: '#c0f2ce',
            200: '#a1ebb6',
            300: '#81e59d',
            400: '#41d76b',
            500: '#2ac656',
            600: '#1c8439',
            700: '#15632b',
            800: '#0e421d',
            900: '#07210e'
          },
          warning: {
            DEFAULT: '#FFA63D',
            50: '#ffedd8',
            100: '#ffdbb1',
            200: '#ffca8b',
            300: '#ffb864',
            400: '#ff9416',
            500: '#ed8000',
            600: '#c66b00',
            700: '#9e5600',
            800: '#4f2b00',
            900: '#271500'
          },
          danger: {
            DEFAULT: '#FF5353',
            50: '#ffdddd',
            100: '#ffbaba',
            200: '#ff9898',
            300: '#ff7575',
            400: '#ff2323',
            500: '#f10000',
            600: '#c10000',
            700: '#910000',
            800: '#610000',
            900: '#300000'
          },
  
          //
          navigation: {
            background: '#212121'
          },
  
          c1: {
            light: '#FFFFFF',
            DEFAULT: 'rgba(var(--clickhouse-color-1), <alpha-value>)',
            dark: '#2F2C3A'
          },
          c2: {
            light: '#F6F7FA',
            DEFAULT: 'rgba(var(--clickhouse-color-2), <alpha-value>)',
            dark: '#373343'
          },
          c3: '#443F51',
          c4: {
            light: '#6D7386',
            DEFAULT: 'rgba(var(--clickhouse-color-4), <alpha-value>)',
            dark: '#B0B4BC'
          },
          c5: {
            light: '#2F2C3A',
            DEFAULT: 'rgba(var(--clickhouse-color-5), <alpha-value>)',
            dark: '#FFFFFF'
          },
          c6: {
            DEFAULT: '#FAFF69',
            text: '#FAFF69',
            link: '#C78F0F'
          },
          c7: {
            light: '#A6770D',
            DEFAULT: 'rgba(var(--clickhouse-color-7), <alpha-value>)',
            dark: '#FFC133'
          },
          gradientTop: '#FAFF69',
          gradientBottom: '#EEF400',
          alerts: {
            danger: {
              text: '#C70F0F',
              background: '#FAE7E7'
            },
            info: {
              text: '#3B73DE',
              background: '#E6F1FA'
            },
            success: {
              text: '#00664B',
              background: '#E6F9F4'
            },
            warning: {
              text: '#805300',
              background: '#FFF8E6'
            }
          }
        },
        boxShadow: {
          card: '0px 4px 4px rgba(0, 0, 0, 0.06), inset 0px 4px 25px rgba(0, 0, 0, 0.14)',
          'card-xl': '0px 4px 14px 4px rgba(0, 0, 0, 0.13)',
          input: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          'click-card':
            '0px 4px 44px rgba(22, 22, 0, 0.4), inset 0px 1px 3px rgba(25, 26, 6, 0.9)',
          'click-pill': '0px -1px 5px rgba(16, 24, 40, 0.07)',
          'click-twitter': '0px 4px 48px rgba(250, 255, 72, 0.2)',
          'footer-line': '0px -1px 1px #000000',
          codeblock:
            '0px 4px 4px rgba(0, 0, 0, 0.06), inset 0px 4px 25px rgba(0, 0, 0, 0.14)',
          header_bottom: 'inset 0px -1px 0px rgba(78, 78, 78, 0.25);',
          noOffset: '0 0 100px -12px rgb(0 0 0 / 0.25)',
          'noOffset-sm': '0 0 48px rgb(0 0 0 / 0.25)',
          stackIntegrationGraphic: '0 4px 60px rgb(251, 255, 70)',
          stackIntegrationGraphicSmall: '0 2px 30px rgb(251, 255, 70)'
        },
        backgroundSize: {
          default_size: '0%, 100%',
          focus_size: '100%, 100%'
        },
        backgroundImage: {
          'air-gapped': 'url("/images/air-gapped.svg")',
          'half-highlight':
            'linear-gradient(to bottom, rgba(65,65,65,1) 56%, transparent 56%)',
          snowflakeGradient:
            'linear-gradient(0deg, #FAFF69 30%, rgba(252, 255, 116, 0) 99.99%)',
          homepageFadeLeftLogos:
            'linear-gradient(90deg, #FAFF69 30%, rgba(252, 255, 116, 0) 99.99%)',
          homepageFadeRightLogos:
            'linear-gradient(270deg, #FAFF69 30%, rgba(252, 255, 116, 0) 99.99%)',
          cloudFadeLeftLogos:
            'linear-gradient(90deg, #1D1D1D 30%, rgba(29, 29, 29, 0.1) 99.99%)',
          cloudFadeRightLogos:
            'linear-gradient(270deg, #1D1D1D 30%, rgba(29, 29, 29, 0.09) 99.99%)',
          field_focus:
            'linear-gradient(0deg, #fbff46, #fbff46 2px, transparent 0, transparent)',
          navDropdown:
            'linear-gradient(to bottom, rgba(65, 65, 65, 0.3) 0px, rgba(65, 65, 65, 0.3) 1px, #282828 1px, #282828 44px, rgba(65, 65, 65, 0.3) 44px, rgba(65, 65, 65, 0.3)45px, #1F1F1C 45px, #1F1F1C 100%)',
          grid: 'url("/dot_grid.svg")',
          'click-grid': 'url("/bg-grid.svg")',
          'home-grid':
            'linear-gradient(117.08deg, rgba(0, 0, 0, 0) 14.55%, rgba(22, 22, 0, 0.167461) 34.15%, rgba(47, 47, 47, 0.22751) 40.54%, rgba(22, 22, 0, 0.611327) 46.65%, #161600 95.98%), url("/bg-grid.png");',
          'speed-lines': 'url("/speed-lines.svg")',
          'speed-lines-ml': 'url("/speed-lines-ml.svg")',
          calendar: 'url("/calendar.svg")',
          'body-image': 'linear-gradient(272.48deg, #292924 1.95%, #0F0F0F 100%)',
          'menu-options':
            'linear-gradient(255.48deg, rgba(41, 41, 36, 0.95) 1.95%, rgba(15, 15, 15, 0.95) 100%)'
        },
        spacing: {
          '30': '7.5rem'
        },
        keyframes: {
          enterFromRight: {
            from: { opacity: 0, transform: 'translateX(200px)' },
            to: { opacity: 1, transform: 'translateX(0)' }
          },
          enterFromLeft: {
            from: { opacity: 0, transform: 'translateX(-200px)' },
            to: { opacity: 1, transform: 'translateX(0)' }
          },
          exitToRight: {
            from: { opacity: 1, transform: 'translateX(0)' },
            to: { opacity: 0, transform: 'translateX(200px)' }
          },
          exitToLeft: {
            from: { opacity: 1, transform: 'translateX(0)' },
            to: { opacity: 0, transform: 'translateX(-200px)' }
          },
          scaleIn: {
            from: { opacity: 0, transform: 'rotateX(-10deg) scale(0.9)' },
            to: { opacity: 1, transform: 'rotateX(0deg) scale(1)' }
          },
          scaleOut: {
            from: { opacity: 1, transform: 'rotateX(0deg) scale(1)' },
            to: { opacity: 0, transform: 'rotateX(-10deg) scale(0.95)' }
          },
          fadeIn: {
            from: { opacity: 0 },
            to: { opacity: 1 }
          },
          fadeOut: {
            from: { opacity: 1 },
            to: { opacity: 0 }
          },
          marqueeLeftTransform: {
            '0%': { transform: 'translateX(0%)' },
            '100%': { transform: 'translateX(-100%)' }
          },
          marqueeLeftTransform2: {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(0%)' }
          },
          loggingFadeSection1: {
            '0%': { opacity: '0.05', transform: 'scale(0.9)' },
            '50%': { opacity: '0.15', transform: 'scale(1.1)' },
            '100%': { opacity: '0.05', transform: 'scale(0.9)' }
          },
          loggingFadeSection2: {
            '0%': { opacity: '0.05', transform: 'scale(0.9)' },
            '50%': { opacity: '0.25', transform: 'scale(1.1)' },
            '100%': { opacity: '0.05', transform: 'scale(0.9)' }
          }
        },
        animation: {
          scaleIn: 'scaleIn 200ms ease',
          scaleOut: 'scaleOut 200ms ease',
          fadeIn: 'fadeIn 200ms ease',
          fadeOut: 'fadeOut 200ms ease',
          enterFromLeft: 'enterFromLeft 250ms ease',
          enterFromRight: 'enterFromRight 250ms ease',
          exitToLeft: 'exitToLeft 250ms ease',
          exitToRight: 'exitToRight 250ms ease',
          marqueeLeft: 'marqueeLeftTransform 75s linear infinite',
          marqueeLeft2: 'marqueeLeftTransform2 75s linear infinite ',
          marqueeLeft3: 'marqueeLeftTransform 90s linear infinite',
          marqueeLeft4: 'marqueeLeftTransform2 90s linear infinite ',
          marqueeLeft5: 'marqueeLeftTransform 190s linear infinite',
          marqueeLeft6: 'marqueeLeftTransform2 190s linear infinite ',
          loggingFadeSection1: 'loggingFadeSection1 5s ease-in-out infinite',
          loggingFadeSection2: 'loggingFadeSection2 5s ease-in-out infinite'
        }
      }
    }
  }
  