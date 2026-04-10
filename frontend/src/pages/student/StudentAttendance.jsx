import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useGetMyAttendanceQuery } from "@/store/api/attendanceApi";

export default function StudentAttendance() {
  const { data, isLoading } = useGetMyAttendanceQuery();

  if (isLoading)
    return <Typography sx={{ fontSize: "13px" }}>Loading…</Typography>;

  const { records = [], percent, totalDays, presentDays } = data || {};

  return (
    <Box>
      <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: "14px" }}>
        Attendance
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "14px",
          mb: "14px",
        }}
      >
        <Box
          sx={{
            bgcolor: "var(--color-background-secondary)",
            borderRadius: "var(--border-radius-md)",
            padding: "12px 14px",
          }}
        >
          <Typography
            sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
          >
            Overall
          </Typography>
          <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>
            {percent != null ? `${percent}%` : "—"}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: "var(--color-background-secondary)",
            borderRadius: "var(--border-radius-md)",
            padding: "12px 14px",
          }}
        >
          <Typography
            sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
          >
            Present
          </Typography>
          <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>
            {presentDays ?? 0}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: "var(--color-background-secondary)",
            borderRadius: "var(--border-radius-md)",
            padding: "12px 14px",
          }}
        >
          <Typography
            sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
          >
            Total days
          </Typography>
          <Typography sx={{ fontSize: "22px", fontWeight: 500 }}>
            {totalDays ?? 0}
          </Typography>
        </Box>
      </Box>

      {records.length > 0 && (
        <Box
          sx={{
            bgcolor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            overflow: "hidden",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 500,
                        bgcolor:
                          r.status === "P"
                            ? "var(--color-background-success)"
                            : "var(--color-background-danger)",
                        color:
                          r.status === "P"
                            ? "var(--color-text-success)"
                            : "var(--color-text-danger)",
                      }}
                    >
                      {r.status === "P" ? "Present" : "Absent"}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
