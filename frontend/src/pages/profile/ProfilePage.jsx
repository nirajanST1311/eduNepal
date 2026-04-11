import { useState, useRef } from "react";
import {
  Box, Typography, Avatar, Chip, Grid, IconButton, TextField, Button,
  CircularProgress, Tooltip, Divider, Alert,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useGetMeQuery, useUpdateProfileMutation, useUploadAvatarMutation } from "@/store/api/authApi";
import PageLoader from "@/components/common/PageLoader";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

const ROLE_COLORS = {
  TEACHER:      { bg: "#ede9fe", color: "#6d28d9" },
  STUDENT:      { bg: "#dcfce7", color: "#15803d" },
  SCHOOL_ADMIN: { bg: "#dbeafe", color: "#1d4ed8" },
  SUPER_ADMIN:  { bg: "#fce7f3", color: "#be185d" },
};

function InfoTile({ icon, label, value, note, muted, children }) {
  return (
    <Box sx={{
      p: 2, borderRadius: 2,
      border: "1px solid var(--color-border-tertiary)",
      bgcolor: "var(--color-background-secondary)",
      display: "flex", alignItems: "center", gap: 1.5,
    }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
        bgcolor: "var(--color-background-info)", color: "var(--color-text-info)",
        display: "flex", alignItems: "center", justifyContent: "center",
        "& .MuiSvgIcon-root": { fontSize: 18 },
      }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: "11px", fontWeight: 500, color: "text.secondary", mb: 0.25 }}>{label}</Typography>
        {children ?? (
          <Typography sx={{ fontSize: "13px", fontWeight: 500, opacity: muted ? 0.45 : 1,
            fontStyle: muted ? "italic" : "normal", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {value}
          </Typography>
        )}
        {note && <Typography sx={{ fontSize: "10px", color: "text.secondary", fontStyle: "italic" }}>{note}</Typography>}
      </Box>
    </Box>
  );
}

export default function ProfilePage() {
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
  const [saveError, setSaveError] = useState("");
  const fileRef = useRef();

  if (isLoading) return <PageLoader variant="card" />;
  if (!profile) return null;

  const initials = (profile.name || "")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const roleCfg = ROLE_COLORS[profile.role] || { bg: "#f1f5f9", color: "#475569" };
  const isBusy = saving || uploading;

  const startEdit = () => {
    setPhone(profile.phone || "");
    setAddress(profile.address || "");
    setAvatarPreview(null);
    setAvatarFile(null);
    setSaveError("");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setAvatarPreview(null);
    setAvatarFile(null);
    setSaveError("");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaveError("");
    try {
      await updateProfile({ phone: phone.trim(), address: address.trim() }).unwrap();
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await uploadAvatar(fd).unwrap();
      }
      setEditing(false);
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (err) {
      setSaveError(err?.data?.message || "Failed to save changes. Please try again.");
    }
  };

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Typography sx={{ fontSize: "22px", fontWeight: 600, mb: 3 }}>{t("profile.title")}</Typography>

      {/* Profile hero card */}
      <Box sx={{ bgcolor: "background.paper", border: (th) => `1px solid ${th.palette.divider}`,
        borderRadius: 3, overflow: "hidden", mb: 2 }}>
        {/* Banner */}
        <Box sx={{ height: 96, background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 55%, #0891b2 100%)" }} />

        <Box sx={{ px: 3, pb: 3 }}>
          {/* Avatar + actions row */}
          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mt: "-44px", mb: 2 }}>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <Avatar
                src={avatarPreview || profile.avatar}
                sx={{
                  width: 88, height: 88, fontSize: "1.875rem", fontWeight: 700,
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#fff",
                  border: "4px solid", borderColor: "background.paper",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                }}
              >
                {initials}
              </Avatar>
              {editing && (
                <Tooltip title="Change photo">
                  <IconButton size="small" onClick={() => fileRef.current?.click()}
                    sx={{
                      position: "absolute", bottom: 2, right: -4,
                      width: 26, height: 26, bgcolor: "#2563eb", color: "#fff",
                      "&:hover": { bgcolor: "#1d4ed8" },
                    }}>
                    <CameraAltOutlinedIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Tooltip>
              )}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignSelf: "flex-end", pb: 0.5 }}>
              {!editing ? (
                <Button size="small" variant="outlined"
                  startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={startEdit} sx={{ textTransform: "none", fontSize: "13px" }}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button size="small" onClick={cancelEdit} disabled={isBusy}
                    startIcon={<CloseOutlinedIcon sx={{ fontSize: 14 }} />}
                    sx={{ textTransform: "none", fontSize: "13px" }}>
                    Cancel
                  </Button>
                  <Button size="small" variant="contained" onClick={handleSave} disabled={isBusy}
                    startIcon={isBusy
                      ? <CircularProgress size={12} color="inherit" />
                      : <CheckOutlinedIcon sx={{ fontSize: 14 }} />}
                    sx={{ textTransform: "none", fontSize: "13px" }}>
                    {isBusy ? "Saving…" : "Save Changes"}
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {/* Name + role */}
          <Typography sx={{ fontSize: "20px", fontWeight: 700, mb: 0.75 }}>{profile.name}</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip label={t(`roles.${profile.role}`)} size="small"
              sx={{ fontWeight: 600, bgcolor: roleCfg.bg, color: roleCfg.color, fontSize: "12px" }} />
            {profile.schoolId?.name && (
              <Chip label={profile.schoolId.name} size="small" variant="outlined" sx={{ fontSize: "12px" }} />
            )}
          </Box>

          {saveError && (
            <Alert severity="error" sx={{ mt: 2, py: 0.5 }}>{saveError}</Alert>
          )}
        </Box>
      </Box>

      {/* Details card */}
      <Box sx={{ bgcolor: "background.paper", border: (th) => `1px solid ${th.palette.divider}`,
        borderRadius: 3, overflow: "hidden" }}>
        {/* Account section */}
        <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
          <Typography sx={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.07em", color: "text.secondary", mb: 1.5 }}>
            Account
          </Typography>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InfoTile icon={<EmailOutlinedIcon />} label="Email" value={profile.email} note="Cannot be changed" />
            </Grid>
            {profile.rollNumber && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoTile icon={<BadgeOutlinedIcon />} label="Roll Number" value={profile.rollNumber} />
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider />

        {/* Contact section */}
        <Box sx={{ px: 2.5, pt: 2.5, pb: 2.5 }}>
          <Typography sx={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.07em", color: "text.secondary", mb: 1.5 }}>
            Contact &amp; Location
          </Typography>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              {editing ? (
                <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                  size="small" fullWidth placeholder="+977 98XXXXXXXX" />
              ) : (
                <InfoTile icon={<PhoneOutlinedIcon />} label="Phone"
                  value={profile.phone || "Not set"} muted={!profile.phone} />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {editing ? (
                <TextField label="Address" value={address} onChange={(e) => setAddress(e.target.value)}
                  size="small" fullWidth placeholder="City, District" />
              ) : (
                <InfoTile icon={<LocationOnOutlinedIcon />} label="Address"
                  value={profile.address || "Not set"} muted={!profile.address} />
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
