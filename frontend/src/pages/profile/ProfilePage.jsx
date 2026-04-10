import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useGetMeQuery } from "@/store/api/authApi";

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth);
  const { data: me } = useGetMeQuery();
  const profile = me || user;

  if (!profile) return null;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Profile
      </Typography>
      <Card>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Avatar sx={{ width: 64, height: 64, fontSize: 26 }}>
            {profile.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h6">{profile.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {profile.email}
            </Typography>
            <Chip label={profile.role} size="small" sx={{ mt: 0.5 }} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
