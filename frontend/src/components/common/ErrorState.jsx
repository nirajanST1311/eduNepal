import { Box, Typography, Button } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import RefreshIcon from "@mui/icons-material/RefreshOutlined";

/**
 * Inline error state for failed API queries.
 * Pass the RTK Query error + refetch function.
 */
export default function ErrorState({ error, onRetry, message }) {
  const msg =
    message ||
    error?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again.";

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
      <ErrorOutlineIcon
        sx={{ fontSize: 44, color: "error.main", opacity: 0.6, mb: 0.5 }}
      />
      <Typography variant="subtitle1" color="text.primary">
        Failed to load data
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 380 }}
      >
        {msg}
      </Typography>
      {onRetry && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      )}
    </Box>
  );
}
