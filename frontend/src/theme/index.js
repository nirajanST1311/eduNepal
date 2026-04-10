import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#2563eb" },
    secondary: { main: "#64748b" },
    success: { main: "#16a34a" },
    warning: { main: "#d97706" },
    error: { main: "#dc2626" },
    info: { main: "#2563eb" },
    background: { default: "#faf8f4", paper: "#ffffff" },
    text: { primary: "#1e293b", secondary: "#64748b" },
    grey: { 50: "#faf8f4", 100: "#f5f0ea", 200: "#e8e0d4", 300: "#cbd5e1" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    h4: { fontWeight: 600, fontSize: "1.5rem" },
    h5: { fontWeight: 600, fontSize: "1.25rem" },
    h6: { fontWeight: 600, fontSize: "1.1rem" },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500, fontSize: "0.85rem" },
    body2: { fontSize: "0.875rem" },
    caption: { fontSize: "0.75rem", color: "#64748b" },
  },
  shape: { borderRadius: 8 },
  shadows: [
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 500, borderRadius: 8 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, fontSize: "0.75rem", borderRadius: 20 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 6, borderRadius: 3 },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiSelect: {
      defaultProps: { size: "small" },
    },
    MuiPaper: {
      styleOverrides: {
        root: { border: "1px solid rgba(0,0,0,0.08)" },
      },
    },
  },
});

export default theme;
