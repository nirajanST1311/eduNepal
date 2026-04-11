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
  Tooltip,
  alpha,
  Chip,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MenuIcon from "@mui/icons-material/MenuOutlined";
import TranslateIcon from "@mui/icons-material/TranslateOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import AppBreadcrumb from "./AppBreadcrumb";
import { logout } from "@/store/slices/authSlice";
import { useThemeMode } from "@/theme/ThemeContext";

const MotionBox = motion.create(Box);

const roleHome = {
  TEACHER: "/teacher",
  STUDENT: "/student",
  SCHOOL_ADMIN: "/admin",
  SUPER_ADMIN: "/superadmin",
};

export default function Header({ onMenuClick }) {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { mode, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    setAnchorEl(null);
    dispatch(logout());
    window.location.href = "/login";
  };

  const toggleLang = () => {
    const next = i18n.language === "ne" ? "en" : "ne";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const initials = (user?.name || "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const basePath = roleHome[user?.role] || "";

  return (
    <MotionBox
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 1.5,
        mb: 1.5,
        borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        bgcolor: (theme) => alpha(theme.palette.background.default, 0.85),
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Left: hamburger + breadcrumb */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
        {onMenuClick && (
          <IconButton
            size="small"
            onClick={onMenuClick}
            sx={{ display: { xs: "flex", md: "none" }, mr: 0.5 }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        )}
        <AppBreadcrumb />
      </Box>

      {/* Right: theme + language toggle + avatar dropdown */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
        <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
          <IconButton size="small" onClick={toggleTheme} sx={{ transition: "transform 0.2s", "&:hover": { transform: "rotate(20deg)" } }}>
            {mode === "dark" ? (
              <LightModeOutlinedIcon sx={{ fontSize: 18, color: "warning.main" }} />
            ) : (
              <DarkModeOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title={i18n.language === "ne" ? "English" : "नेपाली"}>
          <Chip
            icon={<TranslateIcon sx={{ fontSize: 14 }} />}
            label={i18n.language === "ne" ? "EN" : "ने"}
            size="small"
            onClick={toggleLang}
            sx={{
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.6875rem",
              height: 28,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              color: "primary.main",
              "&:hover": { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15) },
            }}
          />
        </Tooltip>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            display: { xs: "none", sm: "block" },
            mr: 0.5,
          }}
        >
          {user?.name}
        </Typography>

        <Tooltip title={t("nav.profile")}>
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ p: 0.5 }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: "0.75rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                color: "#fff",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { transform: "scale(1.08)", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" },
              }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>

        <AnimatePresence>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  minWidth: 200,
                  p: 0.5,
                },
              },
            }}
          >
            {/* User info header */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2">{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />

            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate(`${basePath}/profile`);
              }}
              sx={{ py: 1, mx: 0.5, borderRadius: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 30 }}>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={t("nav.profile")}
                primaryTypographyProps={{ variant: "body2" }}
              />
            </MenuItem>

            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate(`${basePath}/change-password`);
              }}
              sx={{ py: 1, mx: 0.5, borderRadius: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 30 }}>
                <LockOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={t("nav.changePassword")}
                primaryTypographyProps={{ variant: "body2" }}
              />
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem
              onClick={handleLogout}
              sx={{ py: 1, mx: 0.5, borderRadius: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 30 }}>
                <LogoutIcon fontSize="small" sx={{ color: "error.main" }} />
              </ListItemIcon>
              <ListItemText
                primary={t("auth.signOut")}
                primaryTypographyProps={{
                  variant: "body2",
                  color: "error.main",
                }}
              />
            </MenuItem>
          </Menu>
        </AnimatePresence>
      </Box>
    </MotionBox>
  );
}
