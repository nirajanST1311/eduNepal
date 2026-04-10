import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  MenuItem,
  Chip,
  Divider,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const STEPS = [
  "School identity",
  "Location",
  "Academic setup",
  "Principal account",
  "Review",
];

export default function AddSchool() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    nameEn: "",
    nameNp: "",
    regNo: "",
    emis: "",
    type: "Secondary - Community",
    established: "",
    province: "Bagmati",
    district: "Lalitpur",
    municipality: "Lalitpur Metropolitan City",
    ward: "",
    tole: "",
    addressNp: "",
    gpsLat: "",
    gpsLng: "",
    academicYear: "2081-82 BS",
    students: "",
    grades: [],
    sections: { "1-5": "1 section", "6-8": "1 section", "9-10": "1 section" },
    subjects: [],
    principalName: "",
    principalNameNp: "",
    principalPhone: "",
    principalEmail: "",
    principalCitizenship: "",
    principalAppoint: "",
    password: "",
  });

  // Step content renderers
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={600} sx={{ mb: 2 }}>
                Basic information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="School name (English)"
                    fullWidth
                    size="small"
                    value={form.nameEn}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nameEn: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="School name (Nepali)"
                    fullWidth
                    size="small"
                    value={form.nameNp}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nameNp: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Registration number"
                    fullWidth
                    size="small"
                    value={form.regNo}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, regNo: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="EMIS code"
                    fullWidth
                    size="small"
                    value={form.emis}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, emis: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Established year (BS)"
                    fullWidth
                    size="small"
                    value={form.established}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, established: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone number"
                    fullWidth
                    size="small"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Official email"
                    fullWidth
                    size="small"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="School type"
                    fullWidth
                    size="small"
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      case 1:
        return (
          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={600} sx={{ mb: 2 }}>
                School location
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Province"
                    fullWidth
                    size="small"
                    value={form.province}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, province: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="District"
                    fullWidth
                    size="small"
                    value={form.district}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, district: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Municipality"
                    fullWidth
                    size="small"
                    value={form.municipality}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, municipality: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ward number"
                    fullWidth
                    size="small"
                    value={form.ward}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ward: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tole / Settlement name"
                    fullWidth
                    size="small"
                    value={form.tole}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tole: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full address (Nepali)"
                    fullWidth
                    size="small"
                    value={form.addressNp}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, addressNp: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="GPS latitude"
                    fullWidth
                    size="small"
                    value={form.gpsLat}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, gpsLat: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="GPS longitude"
                    fullWidth
                    size="small"
                    value={form.gpsLng}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, gpsLng: e.target.value }))
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={600} sx={{ mb: 2 }}>
                Academic setup
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Academic year"
                    fullWidth
                    size="small"
                    value={form.academicYear}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, academicYear: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Total enrolled students"
                    fullWidth
                    size="small"
                    value={form.students}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, students: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Grades offered"
                    fullWidth
                    size="small"
                    value={form.grades.join(", ")}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        grades: e.target.value.split(/, ?/g),
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Subjects offered"
                    fullWidth
                    size="small"
                    value={form.subjects.join(", ")}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        subjects: e.target.value.split(/, ?/g),
                      }))
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={600} sx={{ mb: 2 }}>
                Principal details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full name (English)"
                    fullWidth
                    size="small"
                    value={form.principalName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, principalName: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full name (Nepali)"
                    fullWidth
                    size="small"
                    value={form.principalNameNp}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        principalNameNp: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone number"
                    fullWidth
                    size="small"
                    value={form.principalPhone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, principalPhone: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email address"
                    fullWidth
                    size="small"
                    value={form.principalEmail}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, principalEmail: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Citizenship number"
                    fullWidth
                    size="small"
                    value={form.principalCitizenship}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        principalCitizenship: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Appointment date (BS)"
                    fullWidth
                    size="small"
                    value={form.principalAppoint}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        principalAppoint: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Temporary password"
                    fullWidth
                    size="small"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      case 4:
        return (
          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={600} sx={{ mb: 2 }}>
                Review
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  School identity
                </Typography>
                <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 2 }}>
                  <Typography variant="body2">
                    <b>Name (English):</b> {form.nameEn}
                  </Typography>
                  <Typography variant="body2">
                    <b>Name (Nepali):</b> {form.nameNp}
                  </Typography>
                  <Typography variant="body2">
                    <b>Registration no.:</b> {form.regNo}
                  </Typography>
                  <Typography variant="body2">
                    <b>EMIS code:</b> {form.emis}
                  </Typography>
                  <Typography variant="body2">
                    <b>Type:</b> {form.type}
                  </Typography>
                  <Typography variant="body2">
                    <b>Established:</b> {form.established}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Location
                </Typography>
                <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 2 }}>
                  <Typography variant="body2">
                    <b>Province / District:</b> {form.province} -{" "}
                    {form.district}
                  </Typography>
                  <Typography variant="body2">
                    <b>Municipality:</b> {form.municipality}
                  </Typography>
                  <Typography variant="body2">
                    <b>Ward / Tole:</b> {form.ward} - {form.tole}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Academic setup
                </Typography>
                <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 2 }}>
                  <Typography variant="body2">
                    <b>Academic year:</b> {form.academicYear}
                  </Typography>
                  <Typography variant="body2">
                    <b>Grades:</b> {form.grades.join(", ")}
                  </Typography>
                  <Typography variant="body2">
                    <b>Subjects:</b> {form.subjects.join(", ")}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Principal account
                </Typography>
                <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 2 }}>
                  <Typography variant="body2">
                    <b>Name:</b> {form.principalName}
                  </Typography>
                  <Typography variant="body2">
                    <b>Phone (login):</b> {form.principalPhone}
                  </Typography>
                  <Typography variant="body2">
                    <b>Credentials delivery:</b> Via SMS on registration
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/superadmin/schools")}
        sx={{ mb: 2 }}
      >
        Back to schools
      </Button>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
        Register new school
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Lalitpur Metropolitan City · Fill all required fields
      </Typography>
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
        {STEPS.map((label, i) => (
          <Step key={label} completed={step > i}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {renderStep()}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          variant="outlined"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          Back
        </Button>
        {step < 4 ? (
          <Button variant="contained" onClick={() => setStep((s) => s + 1)}>
            {step === 3 ? "Review & submit" : "Next"}
          </Button>
        ) : (
          <Button variant="contained" color="success">
            Register school
          </Button>
        )}
      </Box>
    </Box>
  );
}
