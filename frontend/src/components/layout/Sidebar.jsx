import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Badge,
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

const WIDTH = 180;

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
          borderRight: "0.5px solid var(--color-border-tertiary)",
          bgcolor: "var(--color-background-primary)",
          px: 1,
          pt: 2,
        },
      }}
    >
      <Box sx={{ px: 1.5, mb: isSuperAdmin ? 2.5 : 3 }}>
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: "13px",
            color: "var(--color-text-primary)",
            letterSpacing: -0.3,
            lineHeight: 1.2,
          }}
        >
          EduNepal
        </Typography>
        {isSuperAdmin ? (
          <Box>
            <Typography
              sx={{
                color: "var(--color-text-secondary)",
                fontSize: "11px",
                display: "block",
                mb: 0.5,
              }}
            >
              {user?.municipalityName || "Lalitpur Metropolitan City"}
            </Typography>
            <Box
              sx={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "4px",
                bgcolor: "var(--color-background-success)",
                color: "var(--color-text-success)",
                fontWeight: 500,
                fontSize: "11px",
              }}
            >
              Super admin
            </Box>
          </Box>
        ) : (
          <Typography
            sx={{ color: "var(--color-text-secondary)", fontSize: "11px" }}
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
                sx={{
                  display: "block",
                  px: 1.5,
                  pt: idx === 0 ? 0 : 2,
                  pb: 0.8,
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: 0.5,
                  color: "var(--color-text-secondary)",
                }}
              >
                {item.section.charAt(0) + item.section.slice(1).toLowerCase()}
              </Typography>
            );
          }
          const active = isActive(item.path);
          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: "var(--border-radius-md)",
                mb: 0.3,
                px: 1.5,
                py: 0.8,
                bgcolor: active
                  ? "var(--color-background-info)"
                  : "transparent",
                color: active
                  ? "var(--color-text-info)"
                  : "var(--color-text-secondary)",
                "&:hover": {
                  bgcolor: active
                    ? "var(--color-background-info)"
                    : "var(--color-background-secondary)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 28,
                  color: "inherit",
                  "& .MuiSvgIcon-root": { fontSize: 15, opacity: 0.75 },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: "13px",
                  fontWeight: active ? 500 : 400,
                }}
              />
              {item.badge && (
                <Badge
                  badgeContent={2}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "11px",
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
