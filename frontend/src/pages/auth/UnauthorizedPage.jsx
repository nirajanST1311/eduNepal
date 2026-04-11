import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      <Typography variant="h1" sx={{ mb: 1, fontSize: "3rem", fontWeight: 700 }}>
        403
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t("auth.unauthorized")}
      </Typography>
      <Button variant="outlined" onClick={() => navigate(-1)}>
        {t("auth.goBack")}
      </Button>
    </Box>
  );
}
