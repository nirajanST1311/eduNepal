import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Badge,
  Chip,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
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

const WIDTH = 220;

const navByRole = {
  TEACHER: [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/teacher" },
    { label: "Content", icon: <MenuBookIcon />, path: "/teacher/content" },
    {
      label: "Assignments",
      icon: <AssignmentIcon />,
      path: "/teacher/assignments",
    },
    {
      label: "Attendance",
      icon: <EventAvailableIcon />,
      path: "/teacher/attendance",
    },
    { label: "Students", icon: <PeopleIcon />, path: "/teacher/students" },
  ],
  STUDENT: [
    { label: "Home", icon: <HomeIcon />, path: "/student" },
    { label: "My subjects", icon: <SubjectIcon />, path: "/student/subjects" },
    {
      label: "Assignments",
      icon: <AssignmentIcon />,
      path: "/student/assignments",
    },
    {
      label: "Attendance",
      icon: <EventAvailableIcon />,
      path: "/student/attendance",
    },
    {
      label: "Notices",
      icon: <CampaignIcon />,
      path: "/student/notices",
      badge: true,
    },
  ],
  SCHOOL_ADMIN: [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
    { label: "Teachers", icon: <PeopleIcon />, path: "/admin/teachers" },
    { label: "Students", icon: <PeopleIcon />, path: "/admin/students" },
    { label: "Classes", icon: <SchoolIcon />, path: "/admin/classes" },
    { label: "Notices", icon: <CampaignIcon />, path: "/admin/notices" },
  ],
  SUPER_ADMIN: [
    { section: "OVERVIEW" },
    { label: "Dashboard", icon: <DashboardIcon />, path: "/superadmin" },
    {
      label: "Analytics",
      icon: <BarChartIcon />,
      path: "/superadmin/analytics",
    },
    { section: "MANAGEMENT" },
    { label: "Schools", icon: <SchoolIcon />, path: "/superadmin/schools" },
    {
      label: "Principals",
      icon: <PersonIcon />,
      path: "/superadmin/principals",
    },
    { label: "Notices", icon: <CampaignIcon />, path: "/superadmin/notices" },
    { section: "SYSTEM" },
    { label: "Settings", icon: <SettingsIcon />, path: "/superadmin/settings" },
  ],
};

const rootPaths = ["/teacher", "/student", "/admin", "/superadmin"];

export default function Sidebar() {
  const { user } = useSelector((s) => s.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const items = navByRole[user?.role] || [];

  const isActive = (path) => {
    if (rootPaths.includes(path)) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: WIDTH,
          boxSizing: "border-box",
          borderRight: "1px solid rgba(0,0,0,0.08)",
          bgcolor: "#ffffff",
          px: 1.5,
          pt: 2.5,
        },
      }}
    >
      <Box sx={{ px: 1.5, mb: isSuperAdmin ? 3 : 4 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "#1a5632",
            letterSpacing: -0.3,
            lineHeight: 1.2,
          }}
        >
          EduNepal
        </Typography>
        {isSuperAdmin ? (
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.68rem",
                display: "block",
                mb: 0.5,
              }}
            >
              {user?.municipalityName || "Lalitpur Metropolitan City"}
            </Typography>
            <Chip
              label="Super Admin"
              size="small"
              sx={{
                bgcolor: "#dcfce7",
                color: "#166534",
                fontWeight: 600,
                fontSize: "0.6rem",
                height: 20,
                borderRadius: 1,
              }}
            />
          </Box>
        ) : (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontSize: "0.68rem" }}
          >
            {user?.role === "STUDENT"
              ? `${user?.name || ""} · Class ${user?.grade || ""}${user?.section || ""}`
              : `${user?.name || ""} · ${
                  user?.role === "TEACHER"
                    ? "Teacher"
                    : user?.role === "SCHOOL_ADMIN"
                      ? "Principal"
                      : ""
                }`}
          </Typography>
        )}
      </Box>

      <List disablePadding>
        {items.map((item, idx) => {
          if (item.section) {
            return (
              <Typography
                key={item.section}
                variant="caption"
                sx={{
                  display: "block",
                  px: 1.5,
                  pt: idx === 0 ? 0 : 2,
                  pb: 0.8,
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  letterSpacing: 1,
                  color: "text.secondary",
                  textTransform: "uppercase",
                }}
              >
                {item.section}
              </Typography>
            );
          }
          const active = isActive(item.path);
          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1.5,
                mb: 0.3,
                px: 1.5,
                py: 0.8,
                bgcolor: active ? "rgba(37,99,235,0.08)" : "transparent",
                color: active ? "#2563eb" : "text.secondary",
                "&:hover": {
                  bgcolor: active ? "rgba(37,99,235,0.12)" : "rgba(0,0,0,0.03)",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  variant: "body2",
                  fontWeight: active ? 600 : 400,
                }}
              />
              {item.badge && (
                <Badge
                  badgeContent={2}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.6rem",
                      minWidth: 16,
                      height: 16,
                    },
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}

export { WIDTH as SIDEBAR_WIDTH };
