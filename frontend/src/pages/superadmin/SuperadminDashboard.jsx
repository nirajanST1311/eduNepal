import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetSchoolsQuery } from "@/store/api/schoolApi";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import dayjs from "dayjs";

// Static demo data for the dashboard (until backend analytics API is built)
const SCHOOL_STATS = [
  {
    name: "Shree Janata Secondary",
    attendance: 84,
    content: 65,
    students: 412,
    active: true,
  },
  {
    name: "Bal Mandir Basic",
    attendance: 88,
    content: 71,
    students: 380,
    active: true,
  },
  {
    name: "Kopundol Secondary",
    attendance: 58,
    content: 42,
    students: 510,
    active: false,
    issue: "Low attendance",
  },
  {
    name: "Thaiba Secondary",
    attendance: 74,
    content: 28,
    students: 348,
    active: true,
  },
  {
    name: "Sainbu Basic",
    attendance: 72,
    content: 31,
    students: 290,
    active: true,
  },
  {
    name: "Imadol Basic",
    attendance: 82,
    content: 45,
    students: 210,
    active: true,
  },
];

const ALERTS = [
  {
    icon: <ErrorOutlineIcon sx={{ color: "#dc2626", fontSize: 20 }} />,
    title: "Kopundol Secondary — low attendance",
    desc: "Avg 58% this week · principal notified",
    color: "#fef2f2",
  },
  {
    icon: <ErrorOutlineIcon sx={{ color: "#d97706", fontSize: 20 }} />,
    title: "3 schools — content below 40%",
    desc: "Thaiba, Imadol, Sainbu Basic",
    color: "#fffbeb",
  },
  {
    icon: <ErrorOutlineIcon sx={{ color: "#dc2626", fontSize: 20 }} />,
    title: "Imadol Basic — no principal assigned",
    desc: "School active but principal slot empty",
    color: "#fef2f2",
  },
  {
    icon: <InfoOutlinedIcon sx={{ color: "#2563eb", fontSize: 20 }} />,
    title: "Academic year end in 48 days",
    desc: "Promotion cycle setup recommended",
    color: "#eff6ff",
  },
];

const pctColor = (v) => {
  if (v >= 80) return "#15803d";
  if (v >= 60) return "#92400e";
  return "#dc2626";
};

const barColor = (v) => {
  if (v >= 80) return "#16a34a";
  if (v >= 60) return "#ca8a04";
  return "#dc2626";
};

export default function SuperadminDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { data: schools = [] } = useGetSchoolsQuery();

  const totalSchools = schools.length || 12;
  const totalStudents = SCHOOL_STATS.reduce((a, s) => a + s.students, 0);

  const stats = [
    { label: "Total schools", value: totalSchools },
    { label: "Total students", value: totalStudents.toLocaleString() },
    { label: "Total teachers", value: "186" },
    { label: "Avg\nattendance", value: "81%" },
  ];

  const topSchools = SCHOOL_STATS.slice(0, 4);

  return (
    <Box>
      {/* Header */}
      <Typography variant="h5" fontWeight={600}>
        {user?.municipalityName || "Lalitpur Metropolitan City"}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {dayjs().format("dddd")} · Academic year 2081-82 · {totalSchools}{" "}
        schools under management
      </Typography>

      {/* Stat cards row */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        {stats.map((s) => (
          <Card key={s.label} variant="outlined" sx={{ flex: 1, minWidth: 0 }}>
            <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ whiteSpace: "pre-line", lineHeight: 1.4 }}
              >
                {s.label}
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                {s.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Middle row: School status + Alerts */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        {/* School status */}
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              School status
            </Typography>
            {topSchools.map((s) => (
              <Box
                key={s.name}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 1.2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {s.name}
                </Typography>
                <Chip
                  label={s.issue || "Active"}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    bgcolor: s.issue ? "#fef3c7" : "#dcfce7",
                    color: s.issue ? "#92400e" : "#166534",
                  }}
                />
              </Box>
            ))}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, pt: 1.5 }}
            >
              <Typography variant="caption" color="text.secondary">
                +{Math.max(totalSchools - 4, 8)} more schools
              </Typography>
              <Chip
                label="View all"
                size="small"
                variant="outlined"
                onClick={() => navigate("/superadmin/schools")}
                sx={{
                  height: 24,
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  borderColor: "#d1d5db",
                  color: "text.primary",
                  cursor: "pointer",
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Alerts
            </Typography>
            {ALERTS.map((a, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-start",
                  py: 1.2,
                  borderBottom: i < ALERTS.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: a.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    mt: 0.2,
                  }}
                >
                  {a.icon}
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ lineHeight: 1.3 }}
                  >
                    {a.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {a.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>

      {/* Bottom row: Attendance + Content coverage */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Attendance across schools */}
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Attendance across schools
            </Typography>
            {SCHOOL_STATS.slice(0, 5).map((s) => (
              <Box key={s.name} sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="caption" fontWeight={500}>
                    {s.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ color: pctColor(s.attendance) }}
                  >
                    {s.attendance}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={s.attendance}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "#f3f4f6",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 3,
                      bgcolor: barColor(s.attendance),
                    },
                  }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Content coverage by school */}
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Content coverage by school
            </Typography>
            {SCHOOL_STATS.slice(0, 5).map((s) => (
              <Box key={s.name} sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="caption" fontWeight={500}>
                    {s.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ color: pctColor(s.content) }}
                  >
                    {s.content}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={s.content}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "#f3f4f6",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 3,
                      bgcolor: barColor(s.content),
                    },
                  }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
