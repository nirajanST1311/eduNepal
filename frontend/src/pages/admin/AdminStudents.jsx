import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useGetStudentsQuery } from "@/store/api/studentApi";

export default function AdminStudents() {
  const { user } = useSelector((s) => s.auth);
  const { data: students = [], isLoading } = useGetStudentsQuery({
    schoolId: user?.schoolId,
  });
  const [search, setSearch] = useState("");

  const filtered = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Students
      </Typography>
      <TextField
        size="small"
        placeholder="Search students…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: 260 }}
      />
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Class</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s._id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>
                    {s.classId?.grade} {s.classId?.section}
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="body2" color="text.secondary">
                      No students found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
