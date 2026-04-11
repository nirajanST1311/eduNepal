import { Box, Typography, alpha } from "@mui/material";

export default function StatCard({ label, value, color, icon, trend }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2.5,
        padding: "16px 18px",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        transition: "border-color 0.2s",
        "&:hover": { borderColor: (theme) => alpha(theme.palette.primary.main, 0.2) },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        {icon && (
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              bgcolor: color ? alpha(color, 0.1) : (theme) => alpha(theme.palette.primary.main, 0.08),
              color: color || "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "& .MuiSvgIcon-root": { fontSize: 16 },
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
      <Typography
        variant="h2"
        sx={{
          fontWeight: 700,
          color: color || "text.primary",
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
      {trend && (
        <Typography variant="caption" sx={{ color: trend > 0 ? "success.main" : "error.main" }}>
          {trend > 0 ? "+" : ""}{trend}%
        </Typography>
      )}
    </Box>
  );
}
