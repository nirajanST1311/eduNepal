import { Typography, Breadcrumbs } from "@mui/material";
import { useLocation, Link } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const labelMap = {
  superadmin: "Super Admin",
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  dashboard: "Dashboard",
  analytics: "Analytics",
  schools: "Schools",
  principals: "Principals",
  notices: "Notices",
  settings: "Settings",
  content: "Content",
  assignments: "Assignments",
  attendance: "Attendance",
  students: "Students",
  subjects: "My Subjects",
  profile: "Profile",
  "change-password": "Change Password",
  teachers: "Teachers",
  classes: "Classes",
  add: "Add",
  create: "Create",
  grade: "Grade",
};

export default function AppBreadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon sx={{ fontSize: 14 }} />}
      sx={{ "& .MuiBreadcrumbs-li": { lineHeight: 1 } }}
    >
      {segments.map((seg, i) => {
        const path = "/" + segments.slice(0, i + 1).join("/");
        const label =
          labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
        const isLast = i === segments.length - 1;

        if (isLast) {
          return (
            <Typography
              key={path}
              variant="caption"
              color="text.primary"
              fontWeight={500}
            >
              {label}
            </Typography>
          );
        }
        return (
          <Typography
            key={path}
            component={Link}
            to={path}
            variant="caption"
            sx={{
              color: "text.secondary",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {label}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
}
