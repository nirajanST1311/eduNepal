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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  FormGroup,
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

const PROVINCES = [
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
];

const DISTRICTS_BY_PROVINCE = {
  "Bagmati Province": [
    "Kathmandu",
    "Lalitpur",
    "Bhaktapur",
    "Kavrepalanchok",
    "Nuwakot",
    "Rasuwa",
    "Dhading",
    "Makwanpur",
    "Sindhuli",
    "Ramechhap",
    "Dolakha",
    "Sindhupalchok",
    "Chitwan",
  ],
  "Koshi Province": ["Morang", "Sunsari", "Jhapa", "Ilam", "Panchthar"],
  "Madhesh Province": ["Dhanusha", "Mahottari", "Sarlahi", "Siraha", "Saptari"],
  "Gandaki Province": ["Kaski", "Tanahun", "Lamjung", "Gorkha", "Syangja"],
  "Lumbini Province": ["Rupandehi", "Kapilvastu", "Palpa", "Gulmi", "Dang"],
  "Karnali Province": [
    "Surkhet",
    "Dailekh",
    "Jajarkot",
    "Salyan",
    "Rukum West",
  ],
  "Sudurpashchim Province": [
    "Kailali",
    "Kanchanpur",
    "Dadeldhura",
    "Baitadi",
    "Darchula",
  ],
};

const ACADEMIC_YEARS = ["2081-82 BS", "2082-83 BS", "2083-84 BS"];

const WARDS = Array.from({ length: 35 }, (_, i) => "Ward " + (i + 1));

const ALL_GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

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

const SECTION_OPTIONS = ["1 section", "2 sections", "3 sections", "4 sections"];

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
  const [form, setForm] = useState({
    nameEn: "",
    nameNp: "",
    regNo: "",
    emis: "",
    established: "",
    phone: "",
    email: "",
    schoolLevel: "Secondary (1-12)",
    managementType: "Community",
    affiliationBoard: "NEB \u2014 National Examinations Board",
    sanctionedPositions: "",
    province: "Bagmati Province",
    district: "Lalitpur",
    municipality: "Lalitpur Metropolitan City",
    ward: "",
    tole: "",
    addressNp: "",
    gpsLat: "",
    gpsLng: "",
    academicYear: "2081-82 BS",
    totalStudents: "",
    grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    sectionsPrimary: "1 section",
    sectionsMiddle: "1 section",
    sectionsSecondary: "1 section",
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
    principalAppoint: "",
    password: "",
  });

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

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

  const handleSubmit = async () => {
    setError("");
    try {
      await createSchool({
        name: form.nameEn,
        nameNp: form.nameNp,
        regNo: form.regNo,
        emis: form.emis,
        established: form.established,
        phone: form.phone,
        email: form.email,
        schoolLevel: form.schoolLevel,
        managementType: form.managementType,
        affiliationBoard: form.affiliationBoard,
        sanctionedPositions: form.sanctionedPositions,
        province: form.province,
        district: form.district,
        municipality: form.municipality,
        ward: form.ward,
        tole: form.tole,
        addressNp: form.addressNp,
        gpsLat: form.gpsLat,
        gpsLng: form.gpsLng,
        academicYear: form.academicYear,
        totalStudents: form.totalStudents,
        grades: form.grades,
        sections: {
          primary: form.sectionsPrimary,
          middle: form.sectionsMiddle,
          secondary: form.sectionsSecondary,
        },
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

  const districts = DISTRICTS_BY_PROVINCE[form.province] || [];

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
                label="School name (English)"
                required
                fullWidth
                placeholder="e.g. Shree Janata Secondary School"
                value={form.nameEn}
                onChange={set("nameEn")}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="School name (Nepali)"
                required
                fullWidth
                placeholder="e.g. \u0936\u094d\u0930\u0940 \u091c\u0928\u0924\u093e \u092e\u093e\u0927\u094d\u092f\u092e\u093f\u0915 \u0935\u093f\u0926\u094d\u092f\u093e\u0932\u092f"
                value={form.nameNp}
                onChange={set("nameNp")}
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
                helperText="Issued by Ministry of Education"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="EMIS code"
                required
                fullWidth
                placeholder="e.g. 27021234"
                value={form.emis}
                onChange={set("emis")}
                helperText="Dept. of Education unique code"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Established year (BS)"
                required
                fullWidth
                placeholder="e.g. 2035"
                value={form.established}
                onChange={set("established")}
              />
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
            <Grid size={{ xs: 12 }}>
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
              <FormControl>
                <FormLabel
                  sx={{ fontWeight: 500, fontSize: "0.85rem", mb: 0.5 }}
                >
                  School level *
                </FormLabel>
                <RadioGroup
                  row
                  value={form.schoolLevel}
                  onChange={set("schoolLevel")}
                >
                  <FormControlLabel
                    value="Secondary (1-12)"
                    control={<Radio size="small" />}
                    label="Secondary (1-12)"
                    sx={{
                      border: "1.5px solid",
                      borderColor:
                        form.schoolLevel === "Secondary (1-12)"
                          ? "primary.main"
                          : "grey.300",
                      borderRadius: 2,
                      px: 1.5,
                      mr: 1,
                      bgcolor:
                        form.schoolLevel === "Secondary (1-12)"
                          ? "primary.50"
                          : "transparent",
                    }}
                  />
                  <FormControlLabel
                    value="Basic (1-8)"
                    control={<Radio size="small" />}
                    label="Basic (1-8)"
                    sx={{
                      border: "1.5px solid",
                      borderColor:
                        form.schoolLevel === "Basic (1-8)"
                          ? "primary.main"
                          : "grey.300",
                      borderRadius: 2,
                      px: 1.5,
                    }}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl>
                <FormLabel
                  sx={{ fontWeight: 500, fontSize: "0.85rem", mb: 0.5 }}
                >
                  Management type *
                </FormLabel>
                <RadioGroup
                  row
                  value={form.managementType}
                  onChange={set("managementType")}
                >
                  <FormControlLabel
                    value="Community"
                    control={<Radio size="small" />}
                    label="Community"
                    sx={{
                      border: "1.5px solid",
                      borderColor:
                        form.managementType === "Community"
                          ? "success.main"
                          : "grey.300",
                      borderRadius: 2,
                      px: 1.5,
                      mr: 1,
                      bgcolor:
                        form.managementType === "Community"
                          ? "success.50"
                          : "transparent",
                    }}
                  />
                  <FormControlLabel
                    value="Institutional"
                    control={<Radio size="small" />}
                    label="Institutional"
                    sx={{
                      border: "1.5px solid",
                      borderColor:
                        form.managementType === "Institutional"
                          ? "success.main"
                          : "grey.300",
                      borderRadius: 2,
                      px: 1.5,
                    }}
                  />
                </RadioGroup>
              </FormControl>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Sanctioned teacher positions"
                fullWidth
                placeholder="e.g. 18"
                value={form.sanctionedPositions}
                onChange={set("sanctionedPositions")}
                helperText="\u0926\u0930\u092c\u0928\u094d\u0926\u0940 \u2014 from government record"
              />
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Province"
              required
              fullWidth
              select
              value={form.province}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  province: e.target.value,
                  district: "",
                }))
              }
            >
              {PROVINCES.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="District"
              required
              fullWidth
              select
              value={form.district}
              onChange={set("district")}
            >
              {districts.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Municipality / Rural municipality"
              required
              fullWidth
              value={form.municipality}
              onChange={set("municipality")}
              helperText="Auto-filled from your account"
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
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="GPS latitude"
              fullWidth
              placeholder="e.g. 27.6644"
              value={form.gpsLat}
              onChange={set("gpsLat")}
              helperText="Optional \u2014 for map display"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="GPS longitude"
              fullWidth
              placeholder="e.g. 85.3188"
              value={form.gpsLng}
              onChange={set("gpsLng")}
              helperText="Optional \u2014 for map display"
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
              >
                {ACADEMIC_YEARS.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Total enrolled students"
                fullWidth
                placeholder="e.g. 412"
                value={form.totalStudents}
                onChange={set("totalStudents")}
                helperText="Current year total count"
              />
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
          <SectionHeader
            icon={<SchoolIcon fontSize="small" color="secondary" />}
            title="Sections per grade"
          />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Grades 1-5 (sections)"
                fullWidth
                select
                value={form.sectionsPrimary}
                onChange={set("sectionsPrimary")}
              >
                {SECTION_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Grades 6-8 (sections)"
                fullWidth
                select
                value={form.sectionsMiddle}
                onChange={set("sectionsMiddle")}
              >
                {SECTION_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Grades 9-10 (sections)"
                fullWidth
                select
                value={form.sectionsSecondary}
                onChange={set("sectionsSecondary")}
              >
                {SECTION_OPTIONS.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
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
                helperText="Used as login username"
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Appointment date (BS)"
                fullWidth
                placeholder="e.g. Baisakh 1, 2081"
                value={form.principalAppoint}
                onChange={set("principalAppoint")}
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
                helperText="Principal must change on first login"
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
            ["Name (English)", form.nameEn],
            ["Name (Nepali)", form.nameNp],
            ["Registration no.", form.regNo],
            ["EMIS code", form.emis],
            [
              "Type",
              form.schoolLevel.split(" ")[0] + " \u00b7 " + form.managementType,
            ],
            ["Established", form.established],
          ]}
        />
        <ReviewSection
          title="Location"
          rows={[
            [
              "Province / District",
              form.province.replace(" Province", "") +
                " \u00b7 " +
                form.district,
            ],
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
            onClick={() => setStep((s) => s + 1)}
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
