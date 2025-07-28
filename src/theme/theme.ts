import { createTheme } from '@mui/material/styles';

// Color palette - used as accents only
const colors = {
  darkBlue: '#264C5A',
  teal: '#58957E', 
  yellow: '#FECF2C',
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#FAFAFA',
};

// Clean dark theme - mostly black with white text
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.teal,
      light: '#6BA58C',
      dark: '#4A7A68',
      contrastText: colors.white,
    },
    secondary: {
      main: colors.yellow,
      light: '#FED65F',
      dark: '#E6B928',
      contrastText: colors.black,
    },
    background: {
      default: colors.black,
      paper: '#111111',
    },
    text: {
      primary: colors.white,
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.black,
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#111111',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
  },
});

// Clean light theme - white backgrounds with dark text
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.teal,
      light: '#6BA58C',
      dark: '#4A7A68',
      contrastText: colors.white,
    },
    secondary: {
      main: colors.yellow,
      light: '#FED65F',
      dark: '#E6B928',
      contrastText: colors.black,
    },
    background: {
      default: colors.lightGray,
      paper: colors.white,
    },
    text: {
      primary: '#212121',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.white,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          color: '#212121',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.white,
          border: '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
  },
}); 