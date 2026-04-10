import { Chip } from "@mui/material";

const colorMap = {
  published: { bg: "#dcfce7", color: "#16a34a" },
  graded: { bg: "#dcfce7", color: "#16a34a" },
  submitted: { bg: "#dbeafe", color: "#2563eb" },
  draft: { bg: "#f1f5f9", color: "#64748b" },
  pending: { bg: "#fef3c7", color: "#d97706" },
  not_started: { bg: "#f1f5f9", color: "#94a3b8" },
  late: { bg: "#fef2f2", color: "#dc2626" },
  active: { bg: "#dcfce7", color: "#16a34a" },
  inactive: { bg: "#fef2f2", color: "#dc2626" },
};

export default function StatusBadge({ status, label }) {
  const s = colorMap[status] || colorMap.draft;
  return (
    <Chip
      label={label || status}
      size="small"
      sx={{
        bgcolor: s.bg,
        color: s.color,
        fontWeight: 500,
        fontSize: "0.7rem",
        height: 22,
      }}
    />
  );
}
