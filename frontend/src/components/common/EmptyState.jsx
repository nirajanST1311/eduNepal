import { Box, Typography } from "@mui/material";

export default function EmptyState({ message = "No data yet", icon }) {
  return (
    <Box
      sx={{ textAlign: "center", py: 6, color: "var(--color-text-secondary)" }}
    >
      {icon && <Box sx={{ mb: 1, opacity: 0.5 }}>{icon}</Box>}
      <Typography sx={{ fontSize: "13px" }}>{message}</Typography>
    </Box>
  );
}
