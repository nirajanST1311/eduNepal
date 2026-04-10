import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#1e293b" },
    secondary: { main: "#64748b" },
    success: { main: "#16a34a" },
    warning: { main: "#d97706" },
    error: { main: "#dc2626" },
    info: { main: "#2563eb" },
    background: { default: "#f3f4f6", paper: "#ffffff" },
    text: { primary: "#1e293b", secondary: "#64748b" },
    divider: "rgba(0, 0, 0, 0.15)",
  },
  typography: {
    fontFamily:
      'var(--font-sans, "Inter", "Roboto", "Helvetica", "Arial", sans-serif)',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    h1: { fontSize: "22px", fontWeight: 500, lineHeight: 1.3 },
    h2: { fontSize: "18px", fontWeight: 500, lineHeight: 1.3 },
    h3: { fontSize: "16px", fontWeight: 500, lineHeight: 1.4 },
    h4: { fontSize: "16px", fontWeight: 500 },
    h5: { fontSize: "22px", fontWeight: 500 },
    h6: { fontSize: "16px", fontWeight: 500 },
    subtitle1: { fontSize: "14px", fontWeight: 500 },
    subtitle2: { fontSize: "13px", fontWeight: 500 },
    body1: { fontSize: "14px", fontWeight: 400, lineHeight: 1.7 },
    body2: { fontSize: "13px", fontWeight: 400, lineHeight: 1.7 },
    caption: { fontSize: "12px", fontWeight: 400, color: "#64748b" },
    overline: { fontSize: "11px", fontWeight: 500, letterSpacing: 0.5 },
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
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          boxShadow: "none",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "13px",
          borderRadius: "var(--border-radius-md)",
          padding: "6px 14px",
        },
        outlined: {
          borderWidth: "0.5px",
          borderColor: "var(--color-border-secondary)",
          color: "var(--color-text-primary)",
          "&:hover": {
            borderWidth: "0.5px",
            background: "var(--color-background-secondary)",
          },
        },
        contained: {
          background: "var(--color-text-primary)",
          color: "var(--color-background-primary)",
          "&:hover": { opacity: 0.85, background: "var(--color-text-primary)" },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: "11px",
          borderRadius: 4,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 5,
          borderRadius: 3,
          backgroundColor: "var(--color-border-tertiary)",
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            fontSize: "13px",
            borderRadius: "var(--border-radius-md)",
            "& fieldset": {
              borderWidth: "0.5px",
              borderColor: "var(--color-border-secondary)",
            },
            "&:hover fieldset": {
              borderColor: "var(--color-border-secondary)",
            },
            "&.Mui-focused fieldset": {
              borderWidth: "0.5px",
              borderColor: "var(--color-border-primary)",
            },
          },
          "& .MuiInputBase-input": { padding: "8px 10px" },
        },
      },
    },
    MuiSelect: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: { fontSize: "13px", borderRadius: "var(--border-radius-md)" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: "13px",
          "& fieldset": {
            borderWidth: "0.5px",
            borderColor: "var(--color-border-secondary)",
          },
          "&:hover fieldset": { borderColor: "var(--color-border-secondary)" },
          "&.Mui-focused fieldset": {
            borderWidth: "0.5px",
            borderColor: "var(--color-border-primary)",
          },
        },
        input: { padding: "8px 10px" },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "0.5px solid var(--color-border-tertiary)",
          boxShadow: "none",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "var(--border-radius-lg)",
          border: "0.5px solid var(--color-border-tertiary)",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 36 },
        indicator: { height: 2 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "13px",
          minHeight: 36,
          padding: "6px 12px",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: "13px",
          padding: "9px 10px",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
        },
        head: {
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--color-text-secondary)",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "var(--color-background-secondary)" },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: "var(--border-radius-md)",
          fontSize: "13px",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: "var(--border-radius-md)" },
      },
    },
  },
});

export default theme;
