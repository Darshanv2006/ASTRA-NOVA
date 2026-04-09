/** @type {import('tailwindcss').Config} */
function createOpacityScale(hex) {
  const result = { DEFAULT: hex }
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  ;[5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100].forEach(op => {
    result[op] = `rgba(${r}, ${g}, ${b}, ${op / 100})`
  })
  return result
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space-black': createOpacityScale('#000000'),
        'space-gray': '#0a0a0a',
        'space-blue': createOpacityScale('#0b1021'),
        'charcoal': '#1a1a1a',
        'light-charcoal': '#2a2a2a',
        'accent-blue': createOpacityScale('#0055ff'),
        'accent-cyan': createOpacityScale('#00d4ff'),
        'accent-white': '#ffffff',
        'accent-purple': createOpacityScale('#9333ea'),
        'accent-green': createOpacityScale('#00ff88'),
        'accent-orange': createOpacityScale('#ff6b00'),
        'accent-pink': createOpacityScale('#ff0080'),
        'accent-yellow': createOpacityScale('#ffdd00'),
        'accent-red': createOpacityScale('#ff3333'),
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-sm': 'float 2s ease-in-out infinite',
        'float-lg': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 3s ease infinite',
        'gradient-fast': 'gradient 1.5s ease infinite',
        'glow': 'glow 1s ease-in-out infinite alternate',
        'glow-fast': 'glow 0.5s ease-in-out infinite alternate',
        'spin-slow': 'spin 4s linear infinite',
        'spin-fast': 'spin 1s linear infinite',
        'pulse-ring': 'pulseRing 1s ease-out infinite',
        'float-3d': 'float3d 3s ease-in-out infinite',
        'shimmer': 'shimmer 1s infinite',
        'shimmer-fast': 'shimmer 0.5s infinite',
        'twinkle': 'twinkle 1s ease-in-out infinite',
        'orbit': 'orbit 8s linear infinite',
        'pulse-glow': 'pulseGlow 1s ease-in-out infinite',
        'energy-pulse': 'energyPulse 1s ease-in-out infinite',
        'scanline': 'scanline 2s linear infinite',
        'holographic': 'holographic 3s ease infinite',
        'border-gradient': 'gradientBorder 2s ease infinite',
        'rotate-glow': 'rotateGlow 2s linear infinite',
        'float-rotate': 'floatRotate 4s ease-in-out infinite',
        'pulse-scale': 'pulseScale 1s ease-in-out infinite',
        'zoom-pulse': 'zoomPulse 0.8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 85, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 85, 255, 0.8), 0 0 40px rgba(0, 212, 255, 0.4)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        float3d: {
          '0%, 100%': { transform: 'translateY(0px) rotateX(0deg)' },
          '50%': { transform: 'translateY(-15px) rotateX(5deg)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.5)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 212, 255, 0.8)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 212, 255, 1), 0 0 60px rgba(0, 212, 255, 0.6)' },
        },
        energyPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(0, 212, 255, 0.6)' },
          '70%': { boxShadow: '0 0 0 15px rgba(0, 212, 255, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(0, 212, 255, 0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        holographic: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        gradientBorder: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        rotateGlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        floatRotate: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(3deg)' },
          '50%': { transform: 'translateY(0px) rotate(0deg)' },
          '75%': { transform: 'translateY(-10px) rotate(-3deg)' },
        },
        pulseScale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        zoomPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
        'gradient-neon': 'linear-gradient(90deg, #00d4ff, #9333ea, #00ff88, #00d4ff)',
      },
      boxShadow: {
        'neon-cyan': '0 0 5px rgba(0, 212, 255, 0.5), 0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)',
        'neon-cyan-lg': '0 0 10px rgba(0, 212, 255, 0.6), 0 0 30px rgba(0, 212, 255, 0.4), 0 0 60px rgba(0, 212, 255, 0.2)',
        'neon-purple': '0 0 5px rgba(147, 51, 234, 0.5), 0 0 20px rgba(147, 51, 234, 0.3), 0 0 40px rgba(147, 51, 234, 0.1)',
        'neon-purple-lg': '0 0 10px rgba(147, 51, 234, 0.6), 0 0 30px rgba(147, 51, 234, 0.4), 0 0 60px rgba(147, 51, 234, 0.2)',
        'neon-green': '0 0 5px rgba(0, 255, 136, 0.5), 0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 136, 0.1)',
        'neon-green-lg': '0 0 10px rgba(0, 255, 136, 0.6), 0 0 30px rgba(0, 255, 136, 0.4), 0 0 60px rgba(0, 255, 136, 0.2)',
        'neon-orange': '0 0 5px rgba(255, 107, 0, 0.5), 0 0 20px rgba(255, 107, 0, 0.3), 0 0 40px rgba(255, 107, 0, 0.1)',
        'neon-rainbow': '0 0 5px rgba(0, 212, 255, 0.5), 0 0 20px rgba(147, 51, 234, 0.5), 0 0 40px rgba(0, 255, 136, 0.5)',
        'glow-lg': '0 0 40px rgba(0, 212, 255, 0.3)',
        'glow-xl': '0 0 60px rgba(0, 212, 255, 0.4)',
        'glow-intense': '0 0 80px rgba(0, 212, 255, 0.5), 0 0 120px rgba(147, 51, 234, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(0, 212, 255, 0.2)',
        'inner-glow-lg': 'inset 0 0 40px rgba(0, 212, 255, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '20px',
        '3xl': '30px',
      },
      backgroundSize: {
        '200%': '200% auto',
        '300%': '300% auto',
        '400%': '400% auto',
      },
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}