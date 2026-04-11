import { Box, alpha, useTheme } from "@mui/material";

const statusMap = {
  published: "success",
  graded: "success",
  active: "success",
  submitted: "info",
  draft: "secondary",
  not_started: "secondary",
  pending: "warning",
  late: "error",
  inactive: "error",
};

export default function StatusBadge({ status, label }) {
  const theme = useTheme();
  const colorKey = statusMap[status] || "secondary";
  const paletteColor = theme.palette[colorKey] || theme.palette.secondary;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 1,
        bgcolor: alpha(paletteColor.main, 0.1),
        color: paletteColor.main,
        fontWeight: 600,
        fontSize: "0.6875rem",
        lineHeight: 1.6,
      }}
    >
      {label || status}
    </Box>
  );
}
