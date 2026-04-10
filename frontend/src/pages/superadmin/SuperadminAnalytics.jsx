import { Box, Typography } from "@mui/material";
import { useGetSchoolsQuery } from "@/store/api/schoolApi";

// Static analytics data (until backend analytics endpoint is built)
const SCHOOL_DATA = [
  {
    name: "Shree Janata Secondary",
    students: 412,
    attendance: 84,
    content: 65,
  },
  { name: "Bal Mandir Basic", students: 380, attendance: 88, content: 71 },
  { name: "Kopundol Secondary", students: 510, attendance: 58, content: 42 },
  { name: "Thaiba Secondary", students: 348, attendance: 74, content: 28 },
  { name: "Sainbu Basic", students: 290, attendance: 72, content: 31 },
  { name: "Imadol Basic", students: 210, attendance: 82, content: 45 },
];

const pctColor = (v) => {
  if (v >= 80) return "var(--color-text-success)";
  if (v >= 60) return "var(--color-text-warning)";
  return "var(--color-text-danger)";
};

const stats = [
  { label: "Avg content\ncoverage", value: "54%" },
  { label: "Avg\nattendance", value: "81%" },
  { label: "Assignment\nsubmission", value: "76%" },
  { label: "At-risk\nstudents", value: "142" },
];

export default function SuperadminAnalytics() {
  const { data: schools = [] } = useGetSchoolsQuery();

  // Merge real school names if available, else use static
  const tableData =
    schools.length > 0
      ? SCHOOL_DATA.map((s, i) => ({
          ...s,
          name: schools[i]?.name || s.name,
        }))
      : SCHOOL_DATA;

  const topSchools = [...tableData]
    .sort((a, b) => b.attendance + b.content - (a.attendance + a.content))
    .slice(0, 3);

  const needIntervention = [...tableData]
    .sort((a, b) => a.attendance + a.content - (b.attendance + b.content))
    .slice(0, 3);

  return (
    <Box>
      <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>
        Analytics
      </Typography>
      <Typography
        sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}
      >
        Municipality-wide · Academic year 2081-82
      </Typography>

      {/* Stat cards */}
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

      {/* School-by-school comparison */}
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: 3,
          mb: 3,
        }}
      >
        <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 2 }}>
          School-by-school comparison
        </Typography>

        {/* Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            py: 1,
            borderBottom: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <Typography
            sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
          >
            School
          </Typography>
          <Typography
            sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
            textAlign="center"
          >
            Students
          </Typography>
          <Typography
            sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
            textAlign="center"
          >
            Attendance
          </Typography>
          <Typography
            sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
            textAlign="center"
          >
            Content
          </Typography>
        </Box>

        {/* Rows */}
        {tableData.map((row) => (
          <Box
            key={row.name}
            sx={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              py: 1.5,
              borderBottom: "0.5px solid var(--color-border-tertiary)",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
              {row.name}
            </Typography>
            <Typography sx={{ fontSize: "13px" }} textAlign="center">
              {row.students}
            </Typography>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 500,
                color: pctColor(row.attendance),
              }}
              textAlign="center"
            >
              {row.attendance}%
            </Typography>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 500,
                color: pctColor(row.content),
              }}
              textAlign="center"
            >
              {row.content}%
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Bottom two cards */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Top performing */}
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
            Top performing schools
          </Typography>
          {topSchools.map((s, i) => (
            <Box
              key={s.name}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                py: 1.5,
                borderBottom:
                  i < topSchools.length - 1
                    ? "0.5px solid var(--color-border-tertiary)"
                    : "none",
              }}
            >
              <Box>
                <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                  {s.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {s.attendance}% attendance · {s.content}% content
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
                  bgcolor:
                    i === 0
                      ? "var(--color-background-warning)"
                      : i === 1
                        ? "var(--color-background-tertiary)"
                        : "var(--color-background-warning)",
                  color:
                    i === 0
                      ? "var(--color-text-warning)"
                      : i === 1
                        ? "var(--color-text-primary)"
                        : "var(--color-text-warning)",
                }}
              >
                {`No.${i + 1}`}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Schools needing intervention */}
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
            Schools needing intervention
          </Typography>
          {needIntervention.map((s, i) => {
            const issue =
              s.attendance < 60
                ? `${s.attendance}% attendance this week`
                : s.content < 40
                  ? `Only ${s.content}% content uploaded`
                  : `${s.content}% content · ${s.attendance}% attendance`;
            return (
              <Box
                key={s.name}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 1.5,
                  borderBottom:
                    i < needIntervention.length - 1
                      ? "0.5px solid var(--color-border-tertiary)"
                      : "none",
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                    {s.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {issue}
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
                    border: "0.5px solid var(--color-border-tertiary)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Contact
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
