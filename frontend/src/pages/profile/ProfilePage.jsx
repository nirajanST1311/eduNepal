import { useState, useRef } from "react";
import {
  Box, Typography, Avatar, alpha, Chip, Grid, IconButton, TextField, Button,
  CircularProgress, Tooltip,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useGetMeQuery, useUpdateProfileMutation, useUploadAvatarMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import PageLoader from "@/components/common/PageLoader";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((s) => s.auth);
  const { data: me, isLoading } = useGetMeQuery();
  const { t } = useTranslation();
  const profile = me?.user || me || authUser;

  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: uploading }] = useUploadAvatarMutation();

  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileRef = useRef();

  if (isLoading) return <PageLoader variant="card" />;
  if (!profile) return null;

  const initials = (profile.name || "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const startEdit = () => {
    setPhone(profile.phone || "");
    setAddress(profile.address || "");
    setAvatarPreview(null);
    setAvatarFile(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      await updateProfile({ phone, address }).unwrap();
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await uploadAvatar(fd).unwrap();
      }
      setEditing(false);
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch { /* errors surfaced by RTK */ }
  };

  const infoItems = [
    { icon: <EmailOutlinedIcon />, label: t("auth.email"), value: profile.email, note: "Cannot be changed" },
    profile.schoolId?.name && { icon: <SchoolOutlinedIcon />, label: "School", value: profile.schoolId.name },
    profile.rollNumber && { icon: <BadgeOutlinedIcon />, label: "Roll Number", value: profile.rollNumber },
  ].filter(Boolean);

  return (
    <Box>
      <Typography variant="h1" sx={{ mb: 3 }}>{t("profile.title")}</Typography>

      <Box sx={{ bgcolor: "background.paper", border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 3, overflow: "hidden" }}>
        {/* Gradient banner */}
        <Box sx={{ height: 80, background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #0891b2 100%)" }} />

        <Box sx={{ px: 3, pb: 3, mt: -5 }}>
          {/* Avatar + name row */}
          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={avatarPreview || profile.avatar}
                  sx={{
                    width: 80, height: 80, fontSize: "1.75rem", fontWeight: 700,
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#fff",
                    border: "4px solid", borderColor: "background.paper",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {initials}
                </Avatar>
                {editing && (
                  <Tooltip title="Upload photo">
                    <IconButton
                      size="small"
                      onClick={() => fileRef.current?.click()}
                      sx={{
                        position: "absolute", bottom: 0, right: -4,
                        bgcolor: "var(--color-primary)", color: "#fff",
                        width: 26, height: 26,
                        "&:hover": { bgcolor: "var(--color-primary)", opacity: 0.85 },
                      }}
                    >
                      <CameraAltOutlinedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                )}
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
              </Box>
              <Box sx={{ pb: 0.5 }}>
                <Typography variant="h2" sx={{ fontWeight: 700 }}>{profile.name}</Typography>
                <Chip
                  label={t(`roles.${profile.role}`)}
                  size="small"
                  sx={{ mt: 0.5, fontWeight: 600, bgcolor: "var(--color-background-info)", color: "var(--color-text-info)" }}
                />
              </Box>
            </Box>

            {/* Edit / Save / Cancel */}
            {!editing ? (
              <Button size="small" variant="outlined" startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                onClick={startEdit} sx={{ textTransform: "none", alignSelf: "center" }}>
                Edit
              </Button>
            ) : (
              <Box sx={{ display: "flex", gap: 1, alignSelf: "center" }}>
                <Button size="small" variant="contained" startIcon={saving || uploading ? <CircularProgress size={12} /> : <CheckOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={handleSave} disabled={saving || uploading} sx={{ textTransform: "none" }}>
                  Save
                </Button>
                <Button size="small" startIcon={<CloseOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={cancelEdit} sx={{ textTransform: "none" }}>
                  Cancel
                </Button>
              </Box>
            )}
          </Box>

          {/* Static info */}
          <Grid container spacing={2}>
            {infoItems.map((item, i) => (
              <Grid size={{ xs: 12, sm: 6 }} key={i}>
                <Box sx={{ p: 2, borderRadius: 2, border: "1px solid var(--color-border-tertiary)", bgcolor: "var(--color-background-secondary)", display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "var(--color-background-info)", color: "var(--color-text-info)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, "& .MuiSvgIcon-root": { fontSize: 18 } }}>
                    {item.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary", fontWeight: 500 }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500 }} noWrap>{item.value}</Typography>
                    {item.note && <Typography sx={{ fontSize: "0.625rem", color: "text.secondary", fontStyle: "italic" }}>{item.note}</Typography>}
                  </Box>
                </Box>
              </Grid>
            ))}

            {/* Phone — editable */}
            <Grid size={{ xs: 12, sm: 6 }}>
              {editing ? (
                <TextField
                  label="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  fullWidth size="small"
                  InputProps={{ startAdornment: <PhoneOutlinedIcon sx={{ fontSize: 18, mr: 0.75, color: "var(--color-text-secondary)" }} /> }}
                />
              ) : (
                <Box sx={{ p: 2, borderRadius: 2, border: "1px solid var(--color-border-tertiary)", bgcolor: "var(--color-background-secondary)", display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "var(--color-background-info)", color: "var(--color-text-info)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, "& .MuiSvgIcon-root": { fontSize: 18 } }}>
                    <PhoneOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary", fontWeight: 500 }}>Phone</Typography>
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500 }}>{profile.phone || <span style={{ opacity: 0.4, fontStyle: "italic" }}>Not set</span>}</Typography>
                  </Box>
                </Box>
              )}
            </Grid>

            {/* Address — editable */}
            <Grid size={{ xs: 12, sm: 6 }}>
              {editing ? (
                <TextField
                  label="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  fullWidth size="small"
                  InputProps={{ startAdornment: <LocationOnOutlinedIcon sx={{ fontSize: 18, mr: 0.75, color: "var(--color-text-secondary)" }} /> }}
                />
              ) : (
                <Box sx={{ p: 2, borderRadius: 2, border: "1px solid var(--color-border-tertiary)", bgcolor: "var(--color-background-secondary)", display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "var(--color-background-info)", color: "var(--color-text-info)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, "& .MuiSvgIcon-root": { fontSize: 18 } }}>
                    <LocationOnOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary", fontWeight: 500 }}>Address</Typography>
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500 }}>{profile.address || <span style={{ opacity: 0.4, fontStyle: "italic" }}>Not set</span>}</Typography>
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
