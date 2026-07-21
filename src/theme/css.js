import { alpha } from '@mui/material/styles';

// Reusable style-producing helpers (not components) that any component can
// spread into its `sx` prop.

export function bgBlur({ color = '#000000', blur = 6, opacity = 0.8, imgUrl } = {}) {
  if (imgUrl) {
    return {
      position: 'relative',
      backgroundImage: `url(${imgUrl})`,
      '&:before': {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9,
        content: '""',
        width: '100%',
        height: '100%',
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        backgroundColor: alpha(color, opacity),
      },
    };
  }
  return {
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    backgroundColor: alpha(color, opacity),
  };
}

export function bgGradient({ direction = 'to bottom', startColor, endColor, imgUrl } = {}) {
  if (imgUrl) {
    return {
      background: `linear-gradient(${direction}, ${startColor}, ${endColor}), url(${imgUrl})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
    };
  }
  return { background: `linear-gradient(${direction}, ${startColor}, ${endColor})` };
}

export function textGradient(value) {
  return {
    background: `-webkit-linear-gradient(${value})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };
}

export function paper({ theme, bgcolor, dropdown }) {
  return {
    backgroundColor: bgcolor || theme.palette.background.paper,
    backgroundImage: theme.gradient?.dark?.[500],
    border: `1px solid ${theme.palette.divider}`,
    ...(dropdown && {
      padding: theme.spacing(0.5),
      borderRadius: 12,
      boxShadow: theme.customShadows?.dropdown,
    }),
  };
}

export function menuItem(theme) {
  return {
    ...theme.typography.body2,
    padding: theme.spacing(0.75, 1),
    borderRadius: 8,
    color: theme.palette.text.secondary,
    '&:hover': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-selected': {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.action.selected,
      '&:hover': { backgroundColor: theme.palette.action.hover },
    },
  };
}

export const hideScroll = {
  x: {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    overflowX: 'auto',
    '&::-webkit-scrollbar': { display: 'none' },
  },
  y: {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    overflowY: 'auto',
    '&::-webkit-scrollbar': { display: 'none' },
  },
};

export function borderBgGradient({ backgroundGradient, borderGradient }) {
  return {
    border: '1px solid transparent',
    background: `${backgroundGradient} padding-box, ${borderGradient} border-box`,
  };
}
