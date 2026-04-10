import { Box, Typography, Avatar } from "@mui/material";
import { useSelector } from "react-redux";
import { useGetMeQuery } from "@/store/api/authApi";

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth);
  const { data: me } = useGetMeQuery();
  const profile = me || user;

  if (!profile) return null;

  return (
    <Box>
      <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 3 }}>
        Profile
      </Typography>
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Avatar
          sx={{
            width: 64,
            height: 64,
            fontSize: 26,
            bgcolor: "var(--color-background-info)",
            color: "var(--color-text-info)",
          }}
        >
          {profile.name?.[0]}
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>
            {profile.name}
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            {profile.email}
          </Typography>
          <Box
            component="span"
            sx={{
              display: "inline-block",
              mt: 0.5,
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 500,
              bgcolor: "var(--color-background-secondary)",
              color: "var(--color-text-secondary)",
            }}
          >
            {profile.role}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
