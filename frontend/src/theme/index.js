import { createTheme, alpha } from "@mui/material/styles";

const lightPalette = {
  primary: {
    main: "#2563eb",
    light: "#60a5fa",
    dark: "#1d4ed8",
    contrastText: "#fff",
  },
  secondary: { main: "#64748b", light: "#94a3b8", dark: "#475569" },
  success: { main: "#16a34a", light: "#4ade80", dark: "#15803d" },
  warning: { main: "#d97706", light: "#fbbf24", dark: "#b45309" },
  error: { main: "#dc2626", light: "#f87171", dark: "#b91c1c" },
  info: { main: "#0284c7", light: "#38bdf8", dark: "#0369a1" },
  background: { default: "#f8fafc", paper: "#ffffff" },
  text: { primary: "#0f172a", secondary: "#64748b", disabled: "#94a3b8" },
  divider: "rgba(0, 0, 0, 0.08)",
};

const darkPalette = {
  primary: {
    main: "#60a5fa",
    light: "#93c5fd",
    dark: "#2563eb",
    contrastText: "#0f172a",
  },
  secondary: { main: "#94a3b8", light: "#cbd5e1", dark: "#64748b" },
  success: { main: "#4ade80", light: "#86efac", dark: "#16a34a" },
  warning: { main: "#fbbf24", light: "#fde68a", dark: "#d97706" },
  error: { main: "#f87171", light: "#fca5a5", dark: "#dc2626" },
  info: { main: "#38bdf8", light: "#7dd3fc", dark: "#0284c7" },
  background: { default: "#0f172a", paper: "#1e293b" },
  text: { primary: "#f1f5f9", secondary: "#94a3b8", disabled: "#64748b" },
  divider: "rgba(255, 255, 255, 0.08)",
};

const palette = lightPalette;

const theme = createTheme({
  palette,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.025em",
    },
    h2: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.025em",
    },
    h3: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.4 },
    h4: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.5 },
    h6: { fontSize: "0.8125rem", fontWeight: 600, lineHeight: 1.5 },
    subtitle1: { fontSize: "0.875rem", fontWeight: 500 },
    subtitle2: { fontSize: "0.8125rem", fontWeight: 500 },
    body1: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.6 },
    body2: { fontSize: "0.8125rem", fontWeight: 400, lineHeight: 1.6 },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      color: palette.text.secondary,
    },
    overline: {
      fontSize: "0.6875rem",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
    button: { fontWeight: 500, fontSize: "0.8125rem" },
  },
  shape: { borderRadius: 10 },
  shadows: [
    "none",
    "0 1px 2px 0 rgba(0,0,0,0.05)",
    "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
    "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
    "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
    "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
    ...Array(19).fill("none"),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#cbd5e1",
            borderRadius: 3,
          },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${alpha("#000", 0.08)}`,
          borderRadius: 12,
          transition: "border-color 0.2s, box-shadow 0.2s",
          "&:hover": {
            borderColor: alpha("#000", 0.12),
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.8125rem",
          borderRadius: 8,
          padding: "7px 16px",
          transition: "all 0.2s ease",
        },
        sizeSmall: { padding: "4px 12px", fontSize: "0.75rem" },
        sizeLarge: { padding: "10px 24px", fontSize: "0.875rem" },
        outlined: {
          borderColor: alpha("#000", 0.2),
          "&:hover": {
            borderColor: alpha("#000", 0.3),
            background: alpha("#000", 0.03),
          },
        },
        contained: {
          "&:hover": { opacity: 0.9 },
        },
        text: {
          "&:hover": { background: alpha("#000", 0.04) },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: "all 0.2s ease",
          "&:hover": { background: alpha("#000", 0.05) },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: "0.6875rem",
          borderRadius: 6,
          height: 24,
        },
        sizeSmall: { height: 20, fontSize: "0.625rem" },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 5,
          borderRadius: 3,
          backgroundColor: alpha("#000", 0.06),
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small", variant: "outlined" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            fontSize: "0.8125rem",
            borderRadius: 8,
            transition: "border-color 0.2s",
            "& fieldset": { borderColor: alpha("#000", 0.15), borderWidth: 1 },
            "&:hover fieldset": { borderColor: alpha("#000", 0.25) },
            "&.Mui-focused fieldset": {
              borderWidth: 1.5,
              borderColor: palette.primary.main,
            },
            "&.Mui-error fieldset": { borderColor: palette.error.main },
          },
          "& .MuiInputBase-input": { padding: "9px 12px" },
          "& .MuiFormHelperText-root": {
            fontSize: "0.75rem",
            marginLeft: 2,
            marginTop: 4,
          },
          "& .MuiInputLabel-root": { fontSize: "0.8125rem" },
        },
      },
    },
    MuiSelect: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: { fontSize: "0.8125rem", borderRadius: 8 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: "0.8125rem",
          "& fieldset": { borderColor: alpha("#000", 0.15), borderWidth: 1 },
          "&:hover fieldset": { borderColor: alpha("#000", 0.25) },
          "&.Mui-focused fieldset": {
            borderWidth: 1.5,
            borderColor: palette.primary.main,
          },
        },
        input: { padding: "9px 12px" },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${alpha("#000", 0.08)}`,
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow:
            "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          border: `1px solid ${alpha("#000", 0.08)}`,
          boxShadow:
            "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${alpha("#000", 0.08)}`,
          backgroundImage: "none",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 38 },
        indicator: { height: 2, borderRadius: 1 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.8125rem",
          minHeight: 38,
          padding: "8px 14px",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: "0.8125rem",
          padding: "10px 12px",
          borderBottom: `1px solid ${alpha("#000", 0.06)}`,
        },
        head: {
          fontSize: "0.6875rem",
          fontWeight: 600,
          color: palette.text.secondary,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background 0.15s",
          "&:hover": { backgroundColor: alpha("#000", 0.02) },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8, fontSize: "0.8125rem", alignItems: "center" },
        standardError: { backgroundColor: "#fef2f2", color: "#991b1b" },
        standardSuccess: { backgroundColor: "#f0fdf4", color: "#166534" },
        standardWarning: { backgroundColor: "#fffbeb", color: "#92400e" },
        standardInfo: { backgroundColor: "#eff6ff", color: "#1e40af" },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: "all 0.15s ease",
          "&.Mui-selected": {
            backgroundColor: alpha(palette.primary.main, 0.08),
            color: palette.primary.main,
            "&:hover": { backgroundColor: alpha(palette.primary.main, 0.12) },
          },
        },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: {
          fontSize: "0.75rem",
          borderRadius: 6,
          backgroundColor: "#1e293b",
          padding: "6px 12px",
        },
        arrow: { color: "#1e293b" },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: "0.8125rem" },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          border: `1px solid ${alpha("#000", 0.08)}`,
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
          minWidth: 180,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "0.8125rem",
          borderRadius: 6,
          mx: 4,
          transition: "background 0.15s",
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: { fontWeight: 600, fontSize: "0.625rem" },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: alpha("#000", 0.06) },
      },
    },
  },
});

export function createAppTheme(mode) {
  const p = mode === "dark" ? darkPalette : lightPalette;
  return createTheme({
    ...theme,
    palette: { ...p, mode },
    components: {
      ...theme.components,
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: mode === "dark" ? "#475569" : "#cbd5e1",
              borderRadius: 3,
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : alpha("#000", 0.08)}`,
            backgroundImage: "none",
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : alpha("#000", 0.08)}`,
            borderRadius: 12,
            transition: "border-color 0.2s, box-shadow 0.2s",
            "&:hover": {
              borderColor:
                mode === "dark"
                  ? "rgba(255,255,255,0.12)"
                  : alpha("#000", 0.12),
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : alpha("#000", 0.08)}`,
            backgroundImage: "none",
            backgroundColor: mode === "dark" ? "#1e293b" : undefined,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor:
              mode === "dark" ? "rgba(255,255,255,0.06)" : alpha("#000", 0.06),
          },
        },
      },
    },
  });
}

export default theme;
