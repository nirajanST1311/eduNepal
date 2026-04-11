import { Box, Typography, Avatar, alpha, Chip, Grid } from "@mui/material";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useGetMeQuery } from "@/store/api/authApi";
import PageLoader from "@/components/common/PageLoader";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth);
  const { data: me, isLoading } = useGetMeQuery();
  const { t } = useTranslation();
  const profile = me?.user || me || user;

  if (isLoading) return <PageLoader variant="card" />;
  if (!profile) return null;

  const initials = (profile.name || "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const infoItems = [
    { icon: <EmailOutlinedIcon />, label: t("auth.email"), value: profile.email, note: "Cannot be changed" },
    profile.phone && { icon: <PhoneOutlinedIcon />, label: "Phone", value: profile.phone },
    profile.schoolId?.name && { icon: <SchoolOutlinedIcon />, label: "School", value: profile.schoolId.name },
    profile.rollNumber && { icon: <BadgeOutlinedIcon />, label: "Roll Number", value: profile.rollNumber },
  ].filter(Boolean);

  return (
    <Box>
      <Typography variant="h1" sx={{ mb: 3 }}>
        {t("profile.title")}
      </Typography>

      {/* Profile Card */}
      <Box
        sx={{
          bgcolor: "background.paper",
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {/* Gradient banner */}
        <Box sx={{ height: 80, background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #0891b2 100%)" }} />

        <Box sx={{ px: 3, pb: 3, mt: -5 }}>
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, mb: 3 }}>
            <Avatar
              src={profile.avatar}
              sx={{
                width: 80,
                height: 80,
                fontSize: "1.75rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                color: "#fff",
                border: "4px solid",
                borderColor: "background.paper",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ pb: 0.5 }}>
              <Typography variant="h2" sx={{ fontWeight: 700 }}>{profile.name}</Typography>
              <Chip
                label={t(`roles.${profile.role}`)}
                size="small"
                sx={{
                  mt: 0.5,
                  fontWeight: 600,
                  bgcolor: "var(--color-background-info)",
                  color: "var(--color-text-info)",
                }}
              />
            </Box>
          </Box>

          {/* Info Grid */}
          <Grid container spacing={2}>
            {infoItems.map((item, i) => (
              <Grid size={{ xs: 12, sm: 6 }} key={i}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid var(--color-border-tertiary)",
                    bgcolor: "var(--color-background-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: "var(--color-background-info)",
                      color: "var(--color-text-info)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      "& .MuiSvgIcon-root": { fontSize: 18 },
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary", fontWeight: 500 }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500 }} noWrap>
                      {item.value}
                    </Typography>
                    {item.note && (
                      <Typography sx={{ fontSize: "0.625rem", color: "text.secondary", fontStyle: "italic" }}>
                        {item.note}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
