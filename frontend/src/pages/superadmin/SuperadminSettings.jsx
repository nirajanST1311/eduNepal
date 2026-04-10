import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Button,
  IconButton,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import LaunchIcon from "@mui/icons-material/Launch";
import { useSelector } from "react-redux";

const featureToggles = [
  {
    key: "assignments",
    title: "Assignments & submissions",
    description: "Allow teachers to create assignments and students to submit",
    defaultEnabled: true,
  },
  {
    key: "sms",
    title: "SMS notifications",
    description: "Send SMS alerts to parents for attendance and notices",
    defaultEnabled: false,
  },
  {
    key: "offline",
    title: "Offline content download",
    description: "Allow students to download PDFs for offline access",
    defaultEnabled: true,
  },
  {
    key: "quiz",
    title: "Quiz & assessment module",
    description: "Let teachers create quizzes for students",
    defaultEnabled: true,
  },
];

export default function SuperadminSettings() {
  const { user } = useSelector((s) => s.auth);

  const [municipalityName, setMunicipalityName] = useState(
    user?.municipalityName || "Lalitpur Metropolitan City",
  );
  const [province, setProvince] = useState("Bagmati Province");
  const [contactEmail, setContactEmail] = useState("admin@lalitpur.gov.np");
  const [academicYear, setAcademicYear] = useState("2081-82 BS");
  const [yearStart, setYearStart] = useState("Baisakh 1, 2081");
  const [yearEnd, setYearEnd] = useState("Chaitra 28, 2081");

  const [toggles, setToggles] = useState(() => {
    const map = {};
    featureToggles.forEach((f) => {
      map[f.key] = f.defaultEnabled;
    });
    return map;
  });

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "22px", fontWeight: 500, mb: 0.25 }}>
            Settings
          </Typography>
          <Typography
            sx={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            System configuration for {municipalityName}
          </Typography>
        </Box>
        <IconButton size="small">
          <MoreHorizIcon />
        </IconButton>
      </Box>

      {/* Municipality profile + Academic year */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              bgcolor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              p: 2.5,
              height: "100%",
            }}
          >
            <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 2.5 }}>
              Municipality profile
            </Typography>

            <Typography
              sx={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                display: "block",
                mb: 0.5,
              }}
            >
              Municipality name
            </Typography>
            <TextField
              fullWidth
              value={municipalityName}
              onChange={(e) => setMunicipalityName(e.target.value)}
              sx={{ mb: 2.5 }}
            />

            <Typography
              sx={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                display: "block",
                mb: 0.5,
              }}
            >
              Province
            </Typography>
            <FormControl fullWidth sx={{ mb: 2.5 }}>
              <Select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              >
                <MenuItem value="Koshi Province">Koshi Province</MenuItem>
                <MenuItem value="Madhesh Province">Madhesh Province</MenuItem>
                <MenuItem value="Bagmati Province">Bagmati Province</MenuItem>
                <MenuItem value="Gandaki Province">Gandaki Province</MenuItem>
                <MenuItem value="Lumbini Province">Lumbini Province</MenuItem>
                <MenuItem value="Karnali Province">Karnali Province</MenuItem>
                <MenuItem value="Sudurpashchim Province">
                  Sudurpashchim Province
                </MenuItem>
              </Select>
            </FormControl>

            <Typography
              sx={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                display: "block",
                mb: 0.5,
              }}
            >
              Contact email
            </Typography>
            <TextField
              fullWidth
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              sx={{ mb: 2.5 }}
            />

            <Button variant="outlined" size="small">
              Save changes
            </Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              bgcolor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: "var(--border-radius-lg)",
              p: 2.5,
              height: "100%",
            }}
          >
            <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 2.5 }}>
              Academic year
            </Typography>

            <Typography
              sx={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                display: "block",
                mb: 0.5,
              }}
            >
              Current year
            </Typography>
            <TextField
              fullWidth
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              sx={{ mb: 2.5 }}
            />

            <Typography
              sx={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                display: "block",
                mb: 0.5,
              }}
            >
              Year start
            </Typography>
            <TextField
              fullWidth
              value={yearStart}
              onChange={(e) => setYearStart(e.target.value)}
              sx={{ mb: 2.5 }}
            />

            <Typography
              sx={{
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                display: "block",
                mb: 0.5,
              }}
            >
              Year end
            </Typography>
            <TextField
              fullWidth
              value={yearEnd}
              onChange={(e) => setYearEnd(e.target.value)}
              sx={{ mb: 2.5 }}
            />

            <Button
              variant="outlined"
              size="small"
              endIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
            >
              Set up promotion cycle
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Feature toggles */}
      <Box
        sx={{
          bgcolor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          p: 2.5,
        }}
      >
        <Typography sx={{ fontSize: "14px", fontWeight: 500, mb: 2.5 }}>
          Feature toggles — per school
        </Typography>

        {featureToggles.map((feature, i) => {
          const enabled = toggles[feature.key];
          return (
            <Box
              key={feature.key}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                py: 1.8,
                borderBottom:
                  i < featureToggles.length - 1
                    ? "0.5px solid var(--color-border-tertiary)"
                    : "none",
              }}
            >
              <Box>
                <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                  {feature.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexShrink: 0,
                  ml: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: enabled
                      ? "var(--color-text-success)"
                      : "var(--color-text-danger)",
                  }}
                >
                  {enabled ? "Enabled" : "Disabled"}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleToggle(feature.key)}
                  sx={{
                    minWidth: 0,
                    px: 1.5,
                    fontSize: "11px",
                    borderColor: "var(--color-border-tertiary)",
                    color: "text.secondary",
                  }}
                >
                  Toggle
                </Button>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
