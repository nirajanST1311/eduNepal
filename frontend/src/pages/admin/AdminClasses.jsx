import { useState } from "react";
import { Box, Typography, Card, CardContent, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useSelector } from "react-redux";
import { useGetClassesQuery, useCreateClassMutation, useDeleteClassMutation } from "@/store/api/classApi";

export default function AdminClasses() {
  const { user } = useSelector((s) => s.auth);
  const { data: classes = [] } = useGetClassesQuery({ schoolId: user?.schoolId });
  const [createClass, { isLoading: creating }] = useCreateClassMutation();
  const [deleteClass] = useDeleteClassMutation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ grade: "", section: "", year: new Date().getFullYear() });

  const handleCreate = async () => {
    await createClass({ ...form, schoolId: user?.schoolId }).unwrap();
    setOpen(false);
    setForm({ grade: "", section: "", year: new Date().getFullYear() });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Classes</Typography>
        <Button variant="contained" size="small" onClick={() => setOpen(true)}>Add class</Button>
      </Box>
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Grade</TableCell>
                <TableCell>Section</TableCell>
                <TableCell>Year</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.map((c) => (
                <TableRow key={c._id}>
                  <TableCell>{c.grade}</TableCell>
                  <TableCell>{c.section}</TableCell>
                  <TableCell>{c.year}</TableCell>
                  <TableCell align="right">
                    <Button size="small" color="error" onClick={() => deleteClass(c._id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add class</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField label="Grade" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
          <TextField label="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
          <TextField label="Year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={creating || !form.grade}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
