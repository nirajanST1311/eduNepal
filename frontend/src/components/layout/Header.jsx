import { useState } from "react";
import {
  Box,
  IconButton,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";
import AppBreadcrumb from "./AppBreadcrumb";

const roleHome = {
  TEACHER: "/teacher",
  STUDENT: "/student",
  SCHOOL_ADMIN: "/admin",
  SUPER_ADMIN: "/superadmin",
};

export default function Header() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    setAnchorEl(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const initials = (user?.name || "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 1.5,
        mb: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "#faf8f4",
      }}
    >
      {/* Left: Breadcrumb */}
      <Box sx={{ flex: 1 }}>
        <AppBreadcrumb />
      </Box>

      {/* Right: avatar dropdown */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}
      >
        <Typography variant="caption" color="text.secondary">
          {user?.name}
        </Typography>
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: "0.75rem",
              fontWeight: 600,
              bgcolor: "#2563eb",
              color: "#fff",
            }}
          >
            {initials}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                mt: 0.5,
                minWidth: 160,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate(`${roleHome[user?.role] || ""}/profile`);
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Profile"
              primaryTypographyProps={{ variant: "body2" }}
            />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <LogoutIcon fontSize="small" sx={{ color: "#dc2626" }} />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ variant: "body2", color: "#dc2626" }}
            />
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
