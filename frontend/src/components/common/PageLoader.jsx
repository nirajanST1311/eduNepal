import { Box, Skeleton, Typography } from "@mui/material";

/**
 * Full-page or inline loading placeholder with skeleton lines.
 * variant: "page" | "card" | "table" | "inline"
 */
export default function PageLoader({ variant = "page", rows = 5, label }) {
  if (variant === "inline") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "2px solid",
            borderColor: "primary.main",
            borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
            "@keyframes spin": { to: { transform: "rotate(360deg)" } },
          }}
        />
        <Typography variant="body2" color="text.secondary">
          {label || "Loading…"}
        </Typography>
      </Box>
    );
  }

  if (variant === "card") {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" width="33%" height={80} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={200} />
      </Box>
    );
  }

  if (variant === "table") {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} variant="text" height={40} sx={{ mb: 0.5 }} />
        ))}
      </Box>
    );
  }

  // variant === "page"
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 400,
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "3px solid",
          borderColor: "primary.main",
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
          "@keyframes spin": { to: { transform: "rotate(360deg)" } },
        }}
      />
      <Typography variant="body2" color="text.secondary">
        {label || "Loading…"}
      </Typography>
    </Box>
  );
}
