import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Badge,
  IconButton,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import EventAvailableIcon from "@mui/icons-material/EventAvailableOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import BarChartIcon from "@mui/icons-material/BarChartOutlined";
import SubjectIcon from "@mui/icons-material/AutoStoriesOutlined";
import HomeIcon from "@mui/icons-material/HomeOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";
import CloseIcon from "@mui/icons-material/CloseOutlined";

const MotionListItemButton = motion.create(ListItemButton);

const WIDTH = 220;

const navByRole = {
  TEACHER: [
    { labelKey: "nav.dashboard", icon: <DashboardIcon />, path: "/teacher" },
    { labelKey: "nav.content", icon: <MenuBookIcon />, path: "/teacher/content" },
    { labelKey: "nav.assignments", icon: <AssignmentIcon />, path: "/teacher/assignments" },
    { labelKey: "nav.attendance", icon: <EventAvailableIcon />, path: "/teacher/attendance" },
    { labelKey: "nav.students", icon: <PeopleIcon />, path: "/teacher/students" },
    { labelKey: "nav.notices", icon: <CampaignIcon />, path: "/teacher/notices" },
  ],
  STUDENT: [
    { labelKey: "nav.home", icon: <HomeIcon />, path: "/student" },
    { labelKey: "nav.mySubjects", icon: <SubjectIcon />, path: "/student/subjects" },
    { labelKey: "nav.assignments", icon: <AssignmentIcon />, path: "/student/assignments" },
    { labelKey: "nav.attendance", icon: <EventAvailableIcon />, path: "/student/attendance" },
    { labelKey: "nav.notices", icon: <CampaignIcon />, path: "/student/notices", badge: true },
  ],
  SCHOOL_ADMIN: [
    { labelKey: "nav.dashboard", icon: <DashboardIcon />, path: "/admin" },
    { labelKey: "nav.teachers", icon: <PeopleIcon />, path: "/admin/teachers" },
    { labelKey: "nav.students", icon: <PersonIcon />, path: "/admin/students" },
    { labelKey: "nav.classes", icon: <SchoolIcon />, path: "/admin/classes" },
    { labelKey: "nav.subjects", icon: <SubjectIcon />, path: "/admin/subjects" },
    { labelKey: "nav.notices", icon: <CampaignIcon />, path: "/admin/notices" },
  ],
  SUPER_ADMIN: [
    { section: "nav.overview" },
    { labelKey: "nav.dashboard", icon: <DashboardIcon />, path: "/superadmin" },
    { labelKey: "nav.analytics", icon: <BarChartIcon />, path: "/superadmin/analytics" },
    { section: "nav.management" },
    { labelKey: "nav.schools", icon: <SchoolIcon />, path: "/superadmin/schools" },
    { labelKey: "nav.principals", icon: <PersonIcon />, path: "/superadmin/principals" },
    { labelKey: "nav.notices", icon: <CampaignIcon />, path: "/superadmin/notices" },
    { section: "nav.system" },
    { labelKey: "nav.settings", icon: <SettingsIcon />, path: "/superadmin/settings" },
  ],
};

const rootPaths = ["/teacher", "/student", "/admin", "/superadmin"];

function SidebarContent({ onClose }) {
  const { user } = useSelector((s) => s.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const items = navByRole[user?.role] || [];

  const isActive = (path) => {
    if (rootPaths.includes(path)) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", pt: 2.5, px: 1.5 }}>
      {/* Brand header */}
      <Box sx={{ px: 1, mb: 3, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            {t("app.name")}
          </Typography>
          {isSuperAdmin ? (
            <Box>
              <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                {user?.municipalityName || "Municipality"}
              </Typography>
              <Box
                sx={{
                  display: "inline-block",
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                  color: "success.main",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                }}
              >
                {t("roles.SUPER_ADMIN")}
              </Box>
            </Box>
          ) : (
            <Typography variant="caption" sx={{ lineHeight: 1.4 }}>
              {user?.name || ""}
              {user?.role === "STUDENT" && user?.grade
                ? ` · ${t("nav.classes")} ${user.grade}${user.section || ""}`
                : user?.role
                  ? ` · ${t(`roles.${user.role}`)}`
                  : ""}
            </Typography>
          )}
        </Box>
        {onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ mt: -0.5, mr: -0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <List disablePadding sx={{ flex: 1 }}>
        {items.map((item, idx) => {
          if (item.section) {
            return (
              <Typography
                key={item.section}
                variant="overline"
                sx={{
                  display: "block",
                  px: 1,
                  pt: idx === 0 ? 0 : 2.5,
                  pb: 0.8,
                  color: "text.secondary",
                  fontSize: "0.6875rem",
                }}
              >
                {t(item.section)}
              </Typography>
            );
          }
          const active = isActive(item.path);
          return (
            <MotionListItemButton
              key={item.path}
              onClick={() => handleNav(item.path)}
              whileTap={{ scale: 0.98 }}
              sx={{
                mb: 0.3,
                px: 1.5,
                py: 0.9,
                bgcolor: active
                  ? (theme) => alpha(theme.palette.primary.main, 0.08)
                  : "transparent",
                color: active ? "primary.main" : "text.secondary",
                "&:hover": {
                  bgcolor: active
                    ? (theme) => alpha(theme.palette.primary.main, 0.12)
                    : (theme) => alpha(theme.palette.text.primary, 0.04),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 32,
                  color: "inherit",
                  "& .MuiSvgIcon-root": { fontSize: 18 },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={t(item.labelKey)}
                slotProps={{ primary: { variant: "body2", fontWeight: active ? 600 : 400 } }}
              />
              {item.badge && (
                <Badge
                  variant="dot"
                  color="error"
                  sx={{ "& .MuiBadge-badge": { width: 8, height: 8, minWidth: 8 } }}
                />
              )}
            </MotionListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: WIDTH,
            boxSizing: "border-box",
            bgcolor: "background.paper",
          },
        }}
      >
        <SidebarContent onClose={onMobileClose} />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: WIDTH,
          boxSizing: "border-box",
          bgcolor: "background.paper",
        },
      }}
    >
      <SidebarContent />
    </Drawer>
  );
}

export { WIDTH as SIDEBAR_WIDTH };
