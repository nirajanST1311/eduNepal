import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Box, Button, Typography, Alert, alpha } from "@mui/material";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useLoginMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import FormWrapper from "@/components/common/FormWrapper";
import {
  ControlledTextField,
  ControlledPasswordField,
} from "@/components/common/FormFields";

const MotionBox = motion.create(Box);

const roleHome = {
  SUPER_ADMIN: "/superadmin",
  SCHOOL_ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
};

export default function LoginPage() {
  const [error, setError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (data) => {
    setError("");
    try {
      const res = await login(data).unwrap();
      dispatch(setCredentials(res));
      navigate(roleHome[res.user.role] || "/");
    } catch (err) {
      setError(err?.data?.message || t("auth.loginFailed"));
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.04) 0%, rgba(124,58,237,0.04) 100%)",
      }}
    >
      <MotionBox
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        sx={{
          width: 400,
          bgcolor: "background.paper",
          border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          borderRadius: 3,
          p: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 0.5,
            background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("app.name")}
        </Typography>
        <Typography variant="h3" sx={{ mb: 0.5 }}>
          {t("auth.signIn")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t("auth.loginSubtitle")}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormWrapper
          defaultValues={{ email: "", password: "" }}
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
        >
          <ControlledTextField
            name="email"
            label={t("auth.email")}
            rules={{
              required: t("common.required"),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t("common.invalidEmail"),
              },
            }}
            autoComplete="email"
            autoFocus
          />
          <ControlledPasswordField
            name="password"
            label={t("auth.password")}
            rules={{
              required: t("common.required"),
              minLength: { value: 4, message: t("common.minLength", { min: 4 }) },
            }}
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ mt: 1, py: 1.1 }}
          >
            {isLoading ? t("auth.signingIn") : t("auth.signIn")}
          </Button>
        </FormWrapper>
      </MotionBox>
    </Box>
  );
}
