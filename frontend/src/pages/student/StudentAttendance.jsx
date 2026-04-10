import { Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Chip } from "@mui/material";
import { useGetMyAttendanceQuery } from "@/store/api/attendanceApi";

export default function StudentAttendance() {
  const { data, isLoading } = useGetMyAttendanceQuery();

  if (isLoading) return <Typography>Loading…</Typography>;

  const { records = [], percent, totalDays, presentDays } = data || {};

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Attendance</Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 2, mb: 3 }}>
        <Card><CardContent><Typography variant="caption" color="text.secondary">Overall</Typography><Typography variant="h5">{percent != null ? `${percent}%` : "—"}</Typography></CardContent></Card>
        <Card><CardContent><Typography variant="caption" color="text.secondary">Present</Typography><Typography variant="h5">{presentDays ?? 0}</Typography></CardContent></Card>
        <Card><CardContent><Typography variant="caption" color="text.secondary">Total days</Typography><Typography variant="h5">{totalDays ?? 0}</Typography></CardContent></Card>
      </Box>

      {records.length > 0 && (
        <Card>
          <CardContent sx={{ p: 0 }}>
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
                    <TableCell><Chip label={r.status === "P" ? "Present" : "Absent"} size="small" color={r.status === "P" ? "success" : "error"} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
