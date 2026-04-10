import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h4" sx={{ mb: 1 }}>
        403
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        You don't have permission to view this page
      </Typography>
      <Button variant="outlined" onClick={() => navigate(-1)}>
        Go back
      </Button>
    </Box>
  );
}
