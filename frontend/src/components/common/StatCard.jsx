import { Box, Typography } from "@mui/material";

export default function StatCard({ label, value, color }) {
  return (
    <Box
      sx={{
        bgcolor: "var(--color-background-secondary)",
        borderRadius: "var(--border-radius-md)",
        padding: "12px 14px",
      }}
    >
      <Typography
        sx={{
          fontSize: "12px",
          color: "var(--color-text-secondary)",
          lineHeight: 1.4,
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "22px",
          fontWeight: 500,
          color: color || "var(--color-text-primary)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
