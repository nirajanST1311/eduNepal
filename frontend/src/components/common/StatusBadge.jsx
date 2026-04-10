import { Box } from "@mui/material";

const colorMap = {
  published: {
    bg: "var(--color-background-success)",
    color: "var(--color-text-success)",
  },
  graded: {
    bg: "var(--color-background-success)",
    color: "var(--color-text-success)",
  },
  active: {
    bg: "var(--color-background-success)",
    color: "var(--color-text-success)",
  },
  submitted: {
    bg: "var(--color-background-info)",
    color: "var(--color-text-info)",
  },
  draft: {
    bg: "var(--color-background-secondary)",
    color: "var(--color-text-secondary)",
  },
  not_started: {
    bg: "var(--color-background-secondary)",
    color: "var(--color-text-tertiary)",
  },
  pending: {
    bg: "var(--color-background-warning)",
    color: "var(--color-text-warning)",
  },
  late: {
    bg: "var(--color-background-danger)",
    color: "var(--color-text-danger)",
  },
  inactive: {
    bg: "var(--color-background-danger)",
    color: "var(--color-text-danger)",
  },
};

export default function StatusBadge({ status, label }) {
  const s = colorMap[status] || colorMap.draft;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "4px",
        bgcolor: s.bg,
        color: s.color,
        fontWeight: 500,
        fontSize: "11px",
        lineHeight: 1.5,
      }}
    >
      {label || status}
    </Box>
  );
}
