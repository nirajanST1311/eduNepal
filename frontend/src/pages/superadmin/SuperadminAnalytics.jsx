import { Box, Typography, Card, CardContent, Chip } from "@mui/material";
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
  if (v >= 80) return "#15803d";
  if (v >= 60) return "#92400e";
  return "#dc2626";
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
      <Typography variant="h5" fontWeight={600}>
        Analytics
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Municipality-wide · Academic year 2081-82
      </Typography>

      {/* Stat cards */}
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

      {/* School-by-school comparison */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            School-by-school comparison
          </Typography>

          {/* Header */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              py: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              School
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              Students
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              Attendance
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
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
                borderBottom: "1px solid",
                borderColor: "divider",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                {row.name}
              </Typography>
              <Typography variant="body2" textAlign="center">
                {row.students}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                textAlign="center"
                sx={{ color: pctColor(row.attendance) }}
              >
                {row.attendance}%
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                textAlign="center"
                sx={{ color: pctColor(row.content) }}
              >
                {row.content}%
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Bottom two cards */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Top performing */}
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
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
                    i < topSchools.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {s.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {s.attendance}% attendance · {s.content}% content
                  </Typography>
                </Box>
                <Chip
                  label={`No.${i + 1}`}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    bgcolor:
                      i === 0 ? "#fef3c7" : i === 1 ? "#f3f4f6" : "#fff7ed",
                    color:
                      i === 0 ? "#92400e" : i === 1 ? "#374151" : "#9a3412",
                    height: 26,
                  }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Schools needing intervention */}
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
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
                      i < needIntervention.length - 1 ? "1px solid" : "none",
                    borderColor: "divider",
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {s.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {issue}
                    </Typography>
                  </Box>
                  <Chip
                    label="Contact"
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      height: 26,
                      borderColor: "#d1d5db",
                      color: "text.primary",
                    }}
                  />
                </Box>
              );
            })}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
