import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  MenuItem,
  Grid,
  FormLabel,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Table,
  TableBody,
  TableRow,
  TableCell,
  InputAdornment,
  Alert,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SchoolIcon from "@mui/icons-material/School";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import CheckIcon from "@mui/icons-material/Check";
import { useNavigate } from "react-router-dom";
import { useCreateSchoolMutation } from "../../store/api/schoolApi";

const STEPS = [
  "School identity",
  "Location",
  "Academic setup",
  "Principal account",
  "Review",
];

const ACADEMIC_YEARS = ["2081-82 BS", "2082-83 BS", "2083-84 BS"];

const WARDS = Array.from({ length: 35 }, (_, i) => "Ward " + (i + 1));

const ALL_GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

const BS_YEARS = Array.from({ length: 84 }, (_, i) => String(2083 - i));

const AFFILIATION_BOARDS = [
  "NEB \u2014 National Examinations Board",
  "CTEVT",
  "Other",
];

const DEFAULT_SUBJECTS = [
  "Nepali",
  "English",
  "Mathematics",
  "Science",
  "Social Studies",
  "Health & Physical",
  "Computer Science",
  "Moral Education",
];

function SectionHeader({ icon, title }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      {icon}
      <Typography fontWeight={500} fontSize="14px">
        {title}
      </Typography>
    </Box>
  );
}

function ReviewSection({ title, rows }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontSize: "13px", fontWeight: 500, mb: 1 }}>
        {title}
      </Typography>
      <Box
        sx={{
          bgcolor: "var(--color-background-secondary)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Table size="small">
          <TableBody>
            {rows.map(([label, value], i) => (
              <TableRow key={i} sx={{ "&:last-child td": { borderBottom: 0 } }}>
                <TableCell
                  sx={{
                    color: "text.secondary",
                    width: "40%",
                    py: 1.2,
                    border: 0,
                  }}
                >
                  {label}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 500, py: 1.2, border: 0 }}
                >
                  {value || "\u2014"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}

function generatePassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$";
  let pass = "";
  for (let i = 0; i < 12; i++)
    pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

export default function AddSchool() {
  const navigate = useNavigate();
  const [createSchool, { isLoading }] = useCreateSchoolMutation();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    nameEn: "",
    regNo: "",
    established: "",
    phone: "",
    email: "",
    schoolLevel: "Secondary (1-12)",
    affiliationBoard: "NEB \u2014 National Examinations Board",
    municipality: "Lalitpur Metropolitan City",
    ward: "",
    tole: "",
    addressNp: "",
    academicYear: "2081-82 BS",
    grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    subjects: [
      "Nepali",
      "English",
      "Mathematics",
      "Science",
      "Social Studies",
      "Health & Physical",
    ],
    principalName: "",
    principalNameNp: "",
    principalPhone: "",
    principalEmail: "",
    principalCitizenship: "",
    password: "",
  });

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const toggleGrade = (g) =>
    setForm((f) => ({
      ...f,
      grades: f.grades.includes(g)
        ? f.grades.filter((x) => x !== g)
        : [...f.grades, g].sort((a, b) => a - b),
    }));

  const toggleSubject = (s) =>
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(s)
        ? f.subjects.filter((x) => x !== s)
        : [...f.subjects, s],
    }));

  const stepRequiredFields = [
    [
      { key: "nameEn", label: "School name" },
      { key: "regNo", label: "Registration number" },
      { key: "established", label: "Established year" },
    ],
    [
      { key: "municipality", label: "Municipality" },
      { key: "ward", label: "Ward" },
      { key: "tole", label: "Tole" },
      { key: "addressNp", label: "Full address" },
    ],
    [{ key: "academicYear", label: "Academic year" }],
    [
      { key: "principalName", label: "Principal name" },
      { key: "principalPhone", label: "Phone number" },
      { key: "password", label: "Password" },
    ],
  ];

  const validateStep = (stepIndex) => {
    const required = stepRequiredFields[stepIndex] || [];
    const errors = {};
    for (const { key, label } of required) {
      if (!form[key] || !String(form[key]).trim()) {
        errors[key] = `${label} is required`;
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => s + 1);
    }
  };

  const handleSubmit = async () => {
    setError("");
    try {
      await createSchool({
        name: form.nameEn,
        regNo: form.regNo,
        established: form.established,
        phone: form.phone,
        email: form.email,
        schoolLevel: form.schoolLevel,
        affiliationBoard: form.affiliationBoard,
        municipality: form.municipality,
        ward: form.ward,
        tole: form.tole,
        addressNp: form.addressNp,
        academicYear: form.academicYear,
        grades: form.grades,
        subjects: form.subjects,
        principal: {
          name: form.principalName,
          phone: form.principalPhone,
          email: form.principalEmail,
          password: form.password,
        },
      }).unwrap();
      navigate("/superadmin/schools");
    } catch (err) {
      setError(
        err?.data?.message || "Failed to register school. Please try again.",
      );
    }
  };

  const renderIdentity = () => (
    <>
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader
            icon={<SchoolIcon fontSize="small" color="primary" />}
            title="Basic information"
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="School name"
                required
                fullWidth
                placeholder="e.g. Shree Janata Secondary School"
                value={form.nameEn}
                onChange={set("nameEn")}
                error={Boolean(fieldErrors.nameEn)}
                helperText={fieldErrors.nameEn || ""}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Registration number"
                required
                fullWidth
                placeholder="\u0935\u093f\u0926\u094d\u092f\u093e\u0932\u092f \u0926\u0930\u094d\u0924\u093e \u0928\u092e\u094d\u092c\u0930"
                value={form.regNo}
                onChange={set("regNo")}
                error={Boolean(fieldErrors.regNo)}
                helperText={
                  fieldErrors.regNo || "Issued by Ministry of Education"
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Established year (BS)"
                required
                fullWidth
                select
                value={form.established}
                onChange={set("established")}
                error={Boolean(fieldErrors.established)}
                helperText={fieldErrors.established || ""}
              >
                {BS_YEARS.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone number"
                fullWidth
                placeholder="01-XXXXXXX"
                value={form.phone}
                onChange={set("phone")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Official email"
                fullWidth
                placeholder="school@edu.np"
                value={form.email}
                onChange={set("email")}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <SectionHeader
            icon={<SchoolIcon fontSize="small" color="primary" />}
            title="School type"
          />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant="caption"
                fontWeight={500}
                sx={{ mb: 1, display: "block", color: "text.secondary" }}
              >
                School level *
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                {["Secondary (1-12)", "Basic (1-8)"].map((level) => {
                  const selected = form.schoolLevel === level;
                  return (
                    <Box
                      key={level}
                      onClick={() =>
                        setForm((f) => ({ ...f, schoolLevel: level }))
                      }
                      sx={{
                        flex: 1,
                        py: 1.5,
                        textAlign: "center",
                        borderRadius: 2,
                        cursor: "pointer",
                        fontWeight: 500,
                        fontSize: "0.85rem",
                        border: "1.5px solid",
                        borderColor: selected
                          ? "primary.main"
                          : "var(--color-border-tertiary)",
                        bgcolor: selected
                          ? "var(--color-background-info)"
                          : "transparent",
                        color: selected ? "primary.main" : "text.secondary",
                        transition: "all 0.15s",
                        "&:hover": { borderColor: "primary.main" },
                      }}
                    >
                      {level}
                    </Box>
                  );
                })}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Affiliation board"
                fullWidth
                select
                value={form.affiliationBoard}
                onChange={set("affiliationBoard")}
              >
                {AFFILIATION_BOARDS.map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );

  const renderLocation = () => (
    <Card variant="outlined">
      <CardContent>
        <SectionHeader
          icon={<LocationOnIcon fontSize="small" color="success" />}
          title="School location"
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Municipality"
              required
              fullWidth
              value={form.municipality}
              onChange={set("municipality")}
              error={Boolean(fieldErrors.municipality)}
              helperText={fieldErrors.municipality || ""}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Ward number"
              required
              fullWidth
              select
              value={form.ward}
              onChange={set("ward")}
              error={Boolean(fieldErrors.ward)}
              helperText={fieldErrors.ward || ""}
            >
              {WARDS.map((w) => (
                <MenuItem key={w} value={w}>
                  {w}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Tole / Settlement name"
              required
              fullWidth
              placeholder="e.g. Pulchowk, Patan"
              value={form.tole}
              onChange={set("tole")}
              error={Boolean(fieldErrors.tole)}
              helperText={fieldErrors.tole || ""}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Full address (Nepali)"
              required
              fullWidth
              multiline
              rows={2}
              placeholder="Official address as on documents..."
              value={form.addressNp}
              onChange={set("addressNp")}
              error={Boolean(fieldErrors.addressNp)}
              helperText={fieldErrors.addressNp || ""}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderAcademic = () => (
    <>
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader
            icon={<CalendarMonthIcon fontSize="small" color="primary" />}
            title="Academic year"
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Current academic year"
                required
                fullWidth
                select
                value={form.academicYear}
                onChange={set("academicYear")}
                error={Boolean(fieldErrors.academicYear)}
                helperText={fieldErrors.academicYear || ""}
              >
                {ACADEMIC_YEARS.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader
            icon={<SchoolIcon fontSize="small" color="warning" />}
            title="Grades offered"
          />
          <Typography variant="caption" sx={{ mb: 1.5, display: "block" }}>
            Select all that apply
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {ALL_GRADES.map((g) => {
              const selected = form.grades.includes(g);
              return (
                <Chip
                  key={g}
                  label={"Grade " + g}
                  onClick={() => toggleGrade(g)}
                  variant={selected ? "filled" : "outlined"}
                  color={selected ? "primary" : "default"}
                  sx={{
                    fontWeight: 500,
                    cursor: "pointer",
                    borderColor: selected ? "primary.main" : "grey.300",
                  }}
                />
              );
            })}
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <FormLabel
            sx={{
              fontWeight: 500,
              fontSize: "0.85rem",
              mb: 1,
              display: "block",
            }}
          >
            Subjects offered
          </FormLabel>
          <FormGroup row>
            {DEFAULT_SUBJECTS.map((s) => (
              <FormControlLabel
                key={s}
                control={
                  <Checkbox
                    size="small"
                    checked={form.subjects.includes(s)}
                    onChange={() => toggleSubject(s)}
                  />
                }
                label={s}
              />
            ))}
          </FormGroup>
        </CardContent>
      </Card>
    </>
  );

  const renderPrincipal = () => (
    <>
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader
            icon={<PersonIcon fontSize="small" color="error" />}
            title="Principal details"
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Full name (English)"
                required
                fullWidth
                placeholder="e.g. Hari Prasad Sharma"
                value={form.principalName}
                onChange={set("principalName")}
                error={Boolean(fieldErrors.principalName)}
                helperText={fieldErrors.principalName || ""}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Full name (Nepali)"
                fullWidth
                placeholder="e.g. \u0939\u0930\u093f \u092a\u094d\u0930\u0938\u093e\u0926 \u0936\u0930\u094d\u092e\u093e"
                value={form.principalNameNp}
                onChange={set("principalNameNp")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone number"
                required
                fullWidth
                placeholder="98XXXXXXXX"
                value={form.principalPhone}
                onChange={set("principalPhone")}
                error={Boolean(fieldErrors.principalPhone)}
                helperText={
                  fieldErrors.principalPhone || "Used as login username"
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">+977</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email address"
                fullWidth
                placeholder="principal@school.edu.np"
                value={form.principalEmail}
                onChange={set("principalEmail")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Citizenship number"
                fullWidth
                placeholder="XX-XX-XX-XXXXX"
                value={form.principalCitizenship}
                onChange={set("principalCitizenship")}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <SectionHeader
            icon={<LockIcon fontSize="small" color="secondary" />}
            title="Login credentials"
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Temporary password"
                required
                fullWidth
                placeholder="Set a temporary password"
                value={form.password}
                onChange={set("password")}
                error={Boolean(fieldErrors.password)}
                helperText={
                  fieldErrors.password || "Principal must change on first login"
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.5 }}
              >
                Auto-generate password
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  setForm((f) => ({ ...f, password: generatePassword() }))
                }
              >
                Generate secure password
              </Button>
            </Grid>
          </Grid>
          <Alert
            severity="info"
            variant="outlined"
            sx={{ mt: 2, borderRadius: 2 }}
          >
            Login credentials will be sent to the principal&apos;s phone number
            via SMS after school is registered.
          </Alert>
        </CardContent>
      </Card>
    </>
  );

  const renderReview = () => {
    const gradeRange = form.grades.length
      ? "Grade " +
        Math.min(...form.grades) +
        " \u2013 " +
        Math.max(...form.grades)
      : "\u2014";

    return (
      <>
        <ReviewSection
          title="School identity"
          rows={[
            ["Name", form.nameEn],
            ["Registration no.", form.regNo],
            ["Type", form.schoolLevel],
            ["Established", form.established],
          ]}
        />
        <ReviewSection
          title="Location"
          rows={[
            ["Municipality", form.municipality],
            ["Ward / Tole", form.ward + " \u00b7 " + form.tole],
          ]}
        />
        <ReviewSection
          title="Academic setup"
          rows={[
            ["Academic year", form.academicYear],
            ["Grades", gradeRange],
            ["Subjects", form.subjects.join(", ")],
          ]}
        />
        <ReviewSection
          title="Principal account"
          rows={[
            ["Name", form.principalName],
            ["Phone (login)", "+977 " + form.principalPhone],
            ["Credentials delivery", "Via SMS on registration"],
          ]}
        />
      </>
    );
  };

  const stepContent = [
    renderIdentity,
    renderLocation,
    renderAcademic,
    renderPrincipal,
    renderReview,
  ];

  const nextLabels = [
    "Next \u2014 Location",
    "Next \u2014 Academic setup",
    "Next \u2014 Principal account",
    "Review & submit",
  ];

  return (
    <Box sx={{ maxWidth: 680, mx: "auto" }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 0.25 }}>
        Register new school
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Lalitpur Metropolitan City \u00b7 Fill all required fields
      </Typography>

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
        {STEPS.map((label, i) => (
          <Step key={label} completed={step > i}>
            <StepLabel
              StepIconComponent={({ active, completed }) =>
                completed ? (
                  <CheckCircleIcon
                    sx={{ color: "success.main", fontSize: 28 }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: active ? "text.primary" : "grey.200",
                      color: active ? "#fff" : "text.secondary",
                      fontWeight: 500,
                      fontSize: "0.8rem",
                    }}
                  >
                    {i + 1}
                  </Box>
                )
              }
            >
              <Typography variant="caption" fontWeight={step === i ? 600 : 400}>
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {stepContent[step]()}

      {error && (
        <Alert
          severity="error"
          sx={{ mt: 2, borderRadius: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{ display: "flex", justifyContent: "space-between", mt: 3, mb: 4 }}
      >
        {step > 0 ? (
          <Button
            variant="outlined"
            startIcon={<NavigateBeforeIcon />}
            onClick={() => setStep((s) => s - 1)}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Back
          </Button>
        ) : (
          <Box />
        )}

        {step < 4 ? (
          <Button
            variant="contained"
            endIcon={<NavigateNextIcon />}
            onClick={handleNext}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {nextLabels[step]}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            onClick={handleSubmit}
            disabled={isLoading}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {isLoading ? "Registering..." : "Register school"}
          </Button>
        )}
      </Box>
    </Box>
  );
}
