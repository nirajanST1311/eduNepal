import { Box, Typography, Button } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import RefreshIcon from "@mui/icons-material/RefreshOutlined";

export default function EmptyState({
  message = "No data yet",
  description,
  icon,
  onRefresh,
  actionLabel,
  onAction,
  actionIcon,
}) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 8,
        px: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box sx={{ mb: 1, opacity: 0.35 }}>
        {icon || <InboxOutlinedIcon sx={{ fontSize: 48 }} />}
      </Box>
      <Typography variant="subtitle1" color="text.primary">
        {message}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
          {description}
        </Typography>
      )}
      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        {onRefresh && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
          >
            Refresh
          </Button>
        )}
        {onAction && (
          <Button
            variant="contained"
            size="small"
            startIcon={actionIcon}
            onClick={onAction}
          >
            {actionLabel || "Add new"}
          </Button>
        )}
      </Box>
    </Box>
  );
}
