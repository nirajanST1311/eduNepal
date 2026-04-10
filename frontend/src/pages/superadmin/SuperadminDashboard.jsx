import { Box, Typography, LinearProgress, Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetSuperadminStatsQuery } from "@/store/api/dashboardApi";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import dayjs from "dayjs";

export default function SuperadminDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { data: stats, isLoading } = useGetSuperadminStatsQuery();

  const totalSchools = stats?.totalSchools ?? 0;
  const totalStudents = stats?.totalStudents ?? 0;
  const totalTeachers = stats?.totalTeachers ?? 0;
  const totalPrincipals = stats?.totalPrincipals ?? 0;
  const schools = stats?.schools ?? [];

  const statCards = [
    { label: "Total schools", value: totalSchools },
    { label: "Total students", value: totalStudents.toLocaleString() },
    { label: "Total teachers", value: totalTeachers },
    { label: "Total\nprincipals", value: totalPrincipals },
  ];

  // Schools without principals
  const noPrincipal = schools.filter((s) => !s.principal);

  // Sort by student count desc for display
  const topSchools = [...schools].sort((a, b) => b.students - a.students);

  // Build alerts from real data
  const alerts = [];
  noPrincipal.forEach((s) => {
    alerts.push({
      title: `${s.name} — no principal assigned`,
      desc: "School active but principal slot empty",
      color: "var(--color-background-danger)",
      iconColor: "var(--color-text-danger)",
    });
  });
  if (alerts.length === 0 && schools.length > 0) {
    alerts.push({
      title: "All schools have principals assigned",
      desc: `${schools.length} schools under management`,
      color: "var(--color-background-success)",
      iconColor: "var(--color-text-success)",
    });
  }

  const StatSkeleton = () => (
    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={80}
          sx={{ flex: 1, borderRadius: "var(--border-radius-lg)" }}
        />
      ))}
    </Box>
  );

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
      {isLoading ? (
        <StatSkeleton />
      ) : (
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          {statCards.map((s) => (
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
      )}

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
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <Skeleton key={i} height={36} sx={{ mb: 0.5 }} />
            ))
          ) : topSchools.length === 0 ? (
            <Typography
              sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
            >
              No schools registered yet
            </Typography>
          ) : (
            <>
              {topSchools.slice(0, 5).map((s) => (
                <Box
                  key={s._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 1.2,
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                      {s.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {s.teachers} teachers · {s.students} students
                    </Typography>
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 500,
                      bgcolor: s.principal
                        ? "var(--color-background-success)"
                        : "var(--color-background-warning)",
                      color: s.principal
                        ? "var(--color-text-success)"
                        : "var(--color-text-warning)",
                    }}
                  >
                    {s.principal ? "Active" : "No principal"}
                  </Box>
                </Box>
              ))}
              {schools.length > 5 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    pt: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    +{schools.length - 5} more schools
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
              )}
            </>
          )}
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
          {alerts.length === 0 ? (
            <Typography
              sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
            >
              No alerts
            </Typography>
          ) : (
            alerts.map((a, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-start",
                  py: 1.2,
                  borderBottom:
                    i < alerts.length - 1
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
                  <InfoOutlinedIcon sx={{ color: a.iconColor, fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 500,
                      lineHeight: 1.3,
                    }}
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
            ))
          )}
        </Box>
      </Box>

      {/* Bottom row: Students per school */}
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: 3,
        }}
      >
        <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
          Students per school
        </Typography>
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} height={32} sx={{ mb: 1 }} />)
        ) : topSchools.length === 0 ? (
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            No data yet
          </Typography>
        ) : (
          topSchools.map((s) => {
            const maxStudents = Math.max(...schools.map((x) => x.students), 1);
            const pct = Math.round((s.students / maxStudents) * 100);
            return (
              <Box key={s._id} sx={{ mb: 1.5 }}>
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
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {s.students}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "var(--color-background-tertiary)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 3,
                      bgcolor: "var(--color-text-success)",
                    },
                  }}
                />
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
