import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetClassesQuery } from "@/store/api/classApi";
import { useGetStudentsQuery } from "@/store/api/studentApi";
import { useGetNoticesQuery } from "@/store/api/noticeApi";
import StatCard from "@/components/common/StatCard";

export default function AdminDashboard() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const { data: classes = [] } = useGetClassesQuery({
    schoolId: user?.schoolId,
  });
  const { data: students = [] } = useGetStudentsQuery({
    schoolId: user?.schoolId,
  });
  const { data: notices = [] } = useGetNoticesQuery({ limit: 5 });

  return (
    <Box>
      <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.5 }}>
        School dashboard
      </Typography>
      <Typography
        sx={{ fontSize: "13px", color: "var(--color-text-secondary)", mb: 3 }}
      >
        Overview for your school.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "14px",
          mb: 3,
        }}
      >
        <StatCard label="Classes" value={classes.length} />
        <StatCard label="Students" value={students.length} />
        <StatCard label="Notices" value={notices.length} />
      </Box>

      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: 2,
          mb: "14px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
            Recent notices
          </Typography>
          <Button
            size="small"
            onClick={() => navigate("/admin/notices")}
            sx={{ fontSize: "13px" }}
          >
            View all
          </Button>
        </Box>
        {notices.slice(0, 3).map((n) => (
          <Box key={n._id} sx={{ py: 0.5 }}>
            <Typography sx={{ fontSize: "13px" }}>{n.title}</Typography>
            <Typography
              sx={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
            >
              {new Date(n.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: 2,
        }}
      >
        <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 1 }}>
          Classes
        </Typography>
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
      </Box>
    </Box>
  );
}
