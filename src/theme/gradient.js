// Named gradient registry, read in components as theme.gradient.<name>.<key>.
// Primary buttons use gradient.green[100] instead of a flat fill.
export default function gradient() {
  return {
    dark: {
      100: 'linear-gradient(0deg, rgba(51,53,52,0.3) 0%, #333534 100%)',
      200: 'radial-gradient(58.38% 58.38% at 48.17% 100%, #272928 0%, #0E0F0E 100%)',
      500: 'linear-gradient(359deg, #121312 -24.23%, #222423 87.11%)',
      800: 'linear-gradient(342deg, #0B0B0B 37.08%, #191B1A 80.99%)',
    },
    green: {
      100: 'linear-gradient(0deg, #A2FF00 0%, #C1FF54 100%)',
      400: 'linear-gradient(0deg, #73B500 0%, #93E800 100%)',
    },
    white: {
      100: 'linear-gradient(111deg, rgba(239,239,239,0.6) -7.31%, rgba(239,239,239,0.08) 34.39%)',
      200: 'linear-gradient(270deg, rgba(239,239,239,0.24) -7.31%, rgba(239,239,239,0) 34.39%)',
    },
    blue: {
      700: 'linear-gradient(180deg, rgba(19,28,76,0.91) 0%, rgba(13,3,52,0.91) 100%)',
    },
    darkGreen: {
      500: 'linear-gradient(135deg, #44A965 -0.72%, #0F682D 96.83%)',
    },
    lightBlue: {
      500: 'linear-gradient(180deg, #28BEFF 0%, #00A3FF 100%)',
    },
  };
}
