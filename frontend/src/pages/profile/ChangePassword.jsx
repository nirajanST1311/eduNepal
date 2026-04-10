import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { useChangePasswordMutation } from "@/store/api/authApi";

export default function ChangePassword() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [msg, setMsg] = useState(null);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (form.newPassword !== form.confirmPassword) {
      setMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }).unwrap();
      setMsg({ type: "success", text: "Password changed." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.data?.message || "Failed to change password.",
      });
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Change password
      </Typography>
      <Card>
        <CardContent
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxWidth: 400,
          }}
        >
          {msg && <Alert severity={msg.type}>{msg.text}</Alert>}
          <TextField
            label="Current password"
            type="password"
            value={form.currentPassword}
            onChange={set("currentPassword")}
            required
          />
          <TextField
            label="New password"
            type="password"
            value={form.newPassword}
            onChange={set("newPassword")}
            required
          />
          <TextField
            label="Confirm new password"
            type="password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            required
          />
          <Button type="submit" variant="contained" disabled={isLoading}>
            Change password
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
