import { useState } from "react";
import { Box, Typography, Button, Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useChangePasswordMutation } from "@/store/api/authApi";
import FormWrapper from "@/components/common/FormWrapper";
import { ControlledPasswordField } from "@/components/common/FormFields";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function ChangePassword() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [msg, setMsg] = useState(null);
  const { t } = useTranslation();

  const handleSubmit = async (data, methods) => {
    setMsg(null);
    if (data.newPassword !== data.confirmPassword) {
      setMsg({ type: "error", text: t("profile.passwordMismatch") });
      return;
    }
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();
      setMsg({ type: "success", text: t("profile.passwordChanged") });
      methods.reset();
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.data?.message || t("profile.passwordFailed"),
      });
    }
  };

  return (
    <Box>
      <Typography variant="h1" sx={{ mb: 3 }}>
        {t("profile.changePassword")}
      </Typography>
      <Box
        sx={{
          bgcolor: "background.paper",
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          overflow: "hidden",
          maxWidth: 480,
        }}
      >
        {/* Header strip */}
        <Box sx={{ px: 3, py: 2, display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid var(--color-border-tertiary)" }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "var(--color-background-warning)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LockOutlinedIcon sx={{ fontSize: 18, color: "var(--color-text-warning)" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>Update Password</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Enter your current password and choose a new one</Typography>
          </Box>
        </Box>

        <FormWrapper
          defaultValues={{ currentPassword: "", newPassword: "", confirmPassword: "" }}
          onSubmit={handleSubmit}
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {msg && (
            <Alert severity={msg.type} sx={{ mb: 1 }}>
              {msg.text}
            </Alert>
          )}
          <ControlledPasswordField
            name="currentPassword"
            label={t("profile.currentPassword")}
            rules={{ required: t("common.required") }}
          />
          <ControlledPasswordField
            name="newPassword"
            label={t("profile.newPassword")}
            rules={{
              required: t("common.required"),
              minLength: { value: 6, message: t("common.minLength", { min: 6 }) },
            }}
          />
          <ControlledPasswordField
            name="confirmPassword"
            label={t("profile.confirmPassword")}
            rules={{ required: t("common.required") }}
          />
          <Button type="submit" variant="contained" disabled={isLoading} sx={{ mt: 1 }}>
            {t("profile.changeBtn")}
          </Button>
        </FormWrapper>
      </Box>
    </Box>
  );
}
