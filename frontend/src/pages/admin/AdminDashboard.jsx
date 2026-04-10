import { Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetClassesQuery } from "@/store/api/classApi";
import { useGetStudentsQuery } from "@/store/api/studentApi";
import { useGetNoticesQuery } from "@/store/api/noticeApi";
import StatCard from "@/components/common/StatCard";

export default function AdminDashboard() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const { data: classes = [] } = useGetClassesQuery({ schoolId: user?.schoolId });
  const { data: students = [] } = useGetStudentsQuery({ schoolId: user?.schoolId });
  const { data: notices = [] } = useGetNoticesQuery({ limit: 5 });

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5 }}>School dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Overview for your school.</Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 2, mb: 3 }}>
        <StatCard label="Classes" value={classes.length} />
        <StatCard label="Students" value={students.length} />
        <StatCard label="Notices" value={notices.length} />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={500}>Recent notices</Typography>
            <Button size="small" onClick={() => navigate("/admin/notices")}>View all</Button>
          </Box>
          {notices.slice(0, 3).map((n) => (
            <Box key={n._id} sx={{ py: 0.5 }}>
              <Typography variant="body2">{n.title}</Typography>
              <Typography variant="caption" color="text.secondary">{new Date(n.createdAt).toLocaleDateString()}</Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>Classes</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Grade</TableCell>
                <TableCell>Section</TableCell>
                <TableCell>Year</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.map((c) => (
                <TableRow key={c._id}>
                  <TableCell>{c.grade}</TableCell>
                  <TableCell>{c.section}</TableCell>
                  <TableCell>{c.year}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
