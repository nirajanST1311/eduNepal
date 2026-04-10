import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useGetSubjectsQuery } from "@/store/api/subjectApi";

export default function AdminTeachers() {
  const { user } = useSelector((s) => s.auth);
  const { data: subjects = [] } = useGetSubjectsQuery({
    schoolId: user?.schoolId,
  });
  const [search, setSearch] = useState("");

  // Derive unique teachers from subjects
  const teacherMap = {};
  subjects.forEach((s) => {
    if (s.teacherId && !teacherMap[s.teacherId._id]) {
      teacherMap[s.teacherId._id] = { ...s.teacherId, subjects: [] };
    }
    if (s.teacherId) teacherMap[s.teacherId._id].subjects.push(s.name);
  });
  const teachers = Object.values(teacherMap).filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Teachers
      </Typography>
      <TextField
        size="small"
        placeholder="Search teachers…"
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
                <TableCell>Subjects</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((t) => (
                <TableRow key={t._id}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.email}</TableCell>
                  <TableCell>{t.subjects.join(", ")}</TableCell>
                </TableRow>
              ))}
              {teachers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="body2" color="text.secondary">
                      No teachers found.
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
