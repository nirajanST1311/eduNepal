import { Box, Typography, LinearProgress } from "@mui/material";
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
    icon: (
      <ErrorOutlineIcon
        sx={{ color: "var(--color-text-danger)", fontSize: 20 }}
      />
    ),
    title: "Kopundol Secondary — low attendance",
    desc: "Avg 58% this week · principal notified",
    color: "var(--color-background-danger)",
  },
  {
    icon: (
      <ErrorOutlineIcon
        sx={{ color: "var(--color-text-warning)", fontSize: 20 }}
      />
    ),
    title: "3 schools — content below 40%",
    desc: "Thaiba, Imadol, Sainbu Basic",
    color: "var(--color-background-warning)",
  },
  {
    icon: (
      <ErrorOutlineIcon
        sx={{ color: "var(--color-text-danger)", fontSize: 20 }}
      />
    ),
    title: "Imadol Basic — no principal assigned",
    desc: "School active but principal slot empty",
    color: "var(--color-background-danger)",
  },
  {
    icon: (
      <InfoOutlinedIcon
        sx={{ color: "var(--color-text-info)", fontSize: 20 }}
      />
    ),
    title: "Academic year end in 48 days",
    desc: "Promotion cycle setup recommended",
    color: "var(--color-background-info)",
  },
];

const pctColor = (v) => {
  if (v >= 80) return "var(--color-text-success)";
  if (v >= 60) return "var(--color-text-warning)";
  return "var(--color-text-danger)";
};

const barColor = (v) => {
  if (v >= 80) return "var(--color-text-success)";
  if (v >= 60) return "var(--color-text-warning)";
  return "var(--color-text-danger)";
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
      <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>
        {user?.municipalityName || "Lalitpur Metropolitan City"}
      </Typography>
      <Typography
        sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}
      >
        {dayjs().format("dddd")} · Academic year 2081-82 · {totalSchools}{" "}
        schools under management
      </Typography>

      {/* Stat cards row */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        {stats.map((s) => (
          <Box
            key={s.label}
            sx={{
              bgcolor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              py: 1.5,
              px: 2,
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                whiteSpace: "pre-line",
                lineHeight: 1.4,
              }}
            >
              {s.label}
            </Typography>
            <Typography sx={{ fontSize: "22px", fontWeight: 500, mt: 0.5 }}>
              {s.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Middle row: School status + Alerts */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        {/* School status */}
        <Box
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            p: 3,
            flex: 1,
          }}
        >
          <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
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
                borderBottom: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                {s.name}
              </Typography>
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: 500,
                  bgcolor: s.issue
                    ? "var(--color-background-warning)"
                    : "var(--color-background-success)",
                  color: s.issue
                    ? "var(--color-text-warning)"
                    : "var(--color-text-success)",
                }}
              >
                {s.issue || "Active"}
              </Box>
            </Box>
          ))}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, pt: 1.5 }}>
            <Typography
              sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
            >
              +{Math.max(totalSchools - 4, 8)} more schools
            </Typography>
            <Box
              component="span"
              onClick={() => navigate("/superadmin/schools")}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 500,
                border: "0.5px solid var(--color-border-tertiary)",
                color: "var(--color-text-primary)",
                cursor: "pointer",
              }}
            >
              View all
            </Box>
          </Box>
        </Box>

        {/* Alerts */}
        <Box
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            p: 3,
            flex: 1,
          }}
        >
          <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
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
                borderBottom:
                  i < ALERTS.length - 1
                    ? "0.5px solid var(--color-border-tertiary)"
                    : "none",
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
                  sx={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.3 }}
                >
                  {a.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {a.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Bottom row: Attendance + Content coverage */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Attendance across schools */}
        <Box
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            p: 3,
            flex: 1,
          }}
        >
          <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
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
                <Typography sx={{ fontSize: "12px", fontWeight: 500 }}>
                  {s.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: pctColor(s.attendance),
                  }}
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
                  bgcolor: "var(--color-background-tertiary)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                    bgcolor: barColor(s.attendance),
                  },
                }}
              />
            </Box>
          ))}
        </Box>

        {/* Content coverage by school */}
        <Box
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            p: 3,
            flex: 1,
          }}
        >
          <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
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
                <Typography sx={{ fontSize: "12px", fontWeight: 500 }}>
                  {s.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: pctColor(s.content),
                  }}
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
                  bgcolor: "var(--color-background-tertiary)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                    bgcolor: barColor(s.content),
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
