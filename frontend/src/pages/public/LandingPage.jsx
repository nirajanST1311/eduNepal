import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Button,
  Grid,
  alpha,
  Skeleton,
  IconButton,
  Tooltip,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import TranslateIcon from "@mui/icons-material/TranslateOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useGetPublicStatsQuery } from "@/store/api/dashboardApi";
import { useLoginMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import { useThemeMode } from "@/theme/ThemeContext";
import FormWrapper from "@/components/common/FormWrapper";
import {
  ControlledTextField,
  ControlledPasswordField,
} from "@/components/common/FormFields";

const MotionBox = motion.create(Box);

const roleHome = {
  SUPER_ADMIN: "/superadmin",
  SCHOOL_ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
};

/* ─── Animated counter hook ─── */
function useAnimatedCount(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!target || started.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            setCount(Math.round(ease * target));
            if (t < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

const statIcons = {
  schools: <SchoolOutlinedIcon />,
  students: <PeopleOutlinedIcon />,
  teachers: <PersonOutlinedIcon />,
  municipalities: <AccountBalanceOutlinedIcon />,
  subjects: <AutoStoriesOutlinedIcon />,
  classes: <ClassOutlinedIcon />,
};

const statColors = {
  schools: "#2563eb",
  students: "#7c3aed",
  teachers: "#0891b2",
  municipalities: "#059669",
  subjects: "#d97706",
  classes: "#e11d48",
};

const features = [
  { key: "attendance", icon: <EventAvailableOutlinedIcon />, color: "#2563eb" },
  { key: "content", icon: <MenuBookOutlinedIcon />, color: "#7c3aed" },
  { key: "assignments", icon: <AssignmentOutlinedIcon />, color: "#0891b2" },
  { key: "analytics", icon: <BarChartOutlinedIcon />, color: "#059669" },
  { key: "notices", icon: <CampaignOutlinedIcon />, color: "#d97706" },
  { key: "multiRole", icon: <GroupsOutlinedIcon />, color: "#e11d48" },
];

/* ─── Animated stat card ─── */
function AnimatedStatCard({ label, value, icon, color, delay }) {
  const { count, ref } = useAnimatedCount(value, 1200 + delay * 200);

  return (
    <MotionBox
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      sx={{
        textAlign: "center",
        p: 2,
        borderRadius: 2.5,
        bgcolor: "var(--color-background-primary)",
        border: "1px solid var(--color-border-tertiary)",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 8px 20px ${alpha(color, 0.15)}`,
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: alpha(color, 0.1),
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 1,
          "& .MuiSvgIcon-root": { fontSize: 20 },
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color, lineHeight: 1.2 }}>
        {count.toLocaleString()}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
        {label}
      </Typography>
    </MotionBox>
  );
}

/* ─── Floating particles background ─── */
function FloatingParticles() {
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {[...Array(6)].map((_, i) => (
        <MotionBox
          key={i}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 4 + i * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
          sx={{
            position: "absolute",
            width: 60 + i * 20,
            height: 60 + i * 20,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(
              ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706", "#e11d48"][i],
              0.08,
            )}, transparent)`,
            top: `${10 + i * 15}%`,
            left: `${5 + (i % 3) * 30}%`,
          }}
        />
      ))}
    </Box>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { mode, toggleTheme } = useThemeMode();
  const { data: stats, isLoading } = useGetPublicStatsQuery();
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [error, setError] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const toggleLang = () => {
    const next = i18n.language === "ne" ? "en" : "ne";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const handleLogin = async (data) => {
    setError("");
    try {
      const res = await login(data).unwrap();
      dispatch(setCredentials(res));
      navigate(roleHome[res.user.role] || "/");
    } catch (err) {
      setError(err?.data?.message || t("auth.loginFailed"));
    }
  };

  const statKeys = ["schools", "students", "teachers", "municipalities", "subjects", "classes"];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", position: "relative" }}>
      {/* Topbar */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          bgcolor: (theme) => alpha(theme.palette.background.default, 0.85),
          backdropFilter: "blur(12px)",
          borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5, px: { xs: 2, md: 4 } }}>
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "1rem", md: "1.125rem" },
              }}
            >
              {t("app.name")}
            </Typography>
          </MotionBox>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
              <IconButton size="small" onClick={toggleTheme}>
                {mode === "dark" ? (
                  <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
                ) : (
                  <DarkModeOutlinedIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title={i18n.language === "ne" ? "English" : "नेपाली"}>
              <IconButton size="small" onClick={toggleLang}>
                <TranslateIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Main Content: Stats Left + Login Right */}
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, md: 4 },
          pt: { xs: 4, md: 8 },
          pb: { xs: 4, md: 6 },
          position: "relative",
        }}
      >
        <FloatingParticles />

        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="flex-start" sx={{ position: "relative", zIndex: 1 }}>
          {/* LEFT — Hero + Stats */}
          <Grid size={{ xs: 12, md: 7 }}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  fontWeight: 700,
                  lineHeight: 1.2,
                  mb: 1.5,
                  letterSpacing: "-0.03em",
                  background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #0891b2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t("public.hero.title")}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontSize: { xs: "0.875rem", md: "0.9375rem" },
                  maxWidth: 520,
                  mb: 4,
                  lineHeight: 1.7,
                }}
              >
                {t("public.hero.subtitle")}
              </Typography>
            </MotionBox>

            {/* Stats Grid */}
            <Grid container spacing={1.5}>
              {statKeys.map((key, i) => (
                <Grid size={{ xs: 4, sm: 4 }} key={key}>
                  {isLoading ? (
                    <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2.5, border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                      <Skeleton variant="circular" width={40} height={40} sx={{ mx: "auto", mb: 1 }} />
                      <Skeleton variant="text" width={50} sx={{ mx: "auto" }} height={28} />
                      <Skeleton variant="text" width={70} sx={{ mx: "auto" }} height={18} />
                    </Box>
                  ) : (
                    <AnimatedStatCard
                      label={t(`public.stats.${key}`)}
                      value={stats?.[key] || 0}
                      icon={statIcons[key]}
                      color={statColors[key]}
                      delay={0.1 * i}
                    />
                  )}
                </Grid>
              ))}
            </Grid>

            {/* Features section (desktop only) */}
            {!isMobile && (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                sx={{ mt: 5 }}
              >
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}>
                  {t("public.features.title")}
                </Typography>
                <Grid container spacing={1.5}>
                  {features.map((f, i) => (
                    <Grid size={{ xs: 6 }} key={f.key}>
                      <MotionBox
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.9 + 0.08 * i }}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid var(--color-border-tertiary)",
                          bgcolor: "var(--color-background-primary)",
                          transition: "border-color 0.2s",
                          "&:hover": { borderColor: alpha(f.color, 0.3) },
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1.5,
                            bgcolor: alpha(f.color, 0.1),
                            color: f.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            "& .MuiSvgIcon-root": { fontSize: 16 },
                          }}
                        >
                          {f.icon}
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                            {t(`public.features.${f.key}.title`)}
                          </Typography>
                          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", lineHeight: 1.4 }}>
                            {t(`public.features.${f.key}.desc`)}
                          </Typography>
                        </Box>
                      </MotionBox>
                    </Grid>
                  ))}
                </Grid>
              </MotionBox>
            )}
          </Grid>

          {/* RIGHT — Login Form */}
          <Grid size={{ xs: 12, md: 5 }}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              sx={{
                bgcolor: "background.paper",
                border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                borderRadius: 3,
                p: { xs: 3, md: 4 },
                position: { md: "sticky" },
                top: { md: 100 },
                boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
              }}
            >
              {/* Decorative gradient bar */}
              <Box
                sx={{
                  height: 4,
                  borderRadius: 2,
                  background: "linear-gradient(90deg, #2563eb, #7c3aed, #0891b2)",
                  mb: 3,
                  mx: -0.5,
                }}
              />

              <Typography
                variant="h3"
                sx={{ mb: 0.5, fontWeight: 700 }}
              >
                {t("auth.signIn")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t("auth.loginSubtitle")}
              </Typography>

              <AnimatePresence>
                {error && (
                  <MotionBox
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  </MotionBox>
                )}
              </AnimatePresence>

              <FormWrapper
                defaultValues={{ email: "", password: "" }}
                onSubmit={handleLogin}
                sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
              >
                <ControlledTextField
                  name="email"
                  label={t("auth.email")}
                  rules={{
                    required: t("common.required"),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: t("common.invalidEmail"),
                    },
                  }}
                  autoComplete="email"
                  autoFocus={!isMobile}
                />
                <ControlledPasswordField
                  name="password"
                  label={t("auth.password")}
                  rules={{
                    required: t("common.required"),
                    minLength: { value: 4, message: t("common.minLength", { min: 4 }) },
                  }}
                  autoComplete="current-password"
                />
                <MotionBox whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loginLoading}
                    sx={{
                      mt: 1.5,
                      py: 1.2,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)",
                      },
                    }}
                    endIcon={!loginLoading && <ArrowForwardIcon />}
                  >
                    {loginLoading ? t("auth.signingIn") : t("auth.signIn")}
                  </Button>
                </MotionBox>
              </FormWrapper>

              {/* Demo credentials hint */}
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "var(--color-background-info)",
                  border: "1px solid var(--color-border-info)",
                }}
              >
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-info)", mb: 0.5 }}>
                  Demo Accounts
                </Typography>
                <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary", fontFamily: "var(--font-mono)", lineHeight: 1.8 }}>
                  admin@municipality.gov.np<br />
                  teacher1@school1.edu.np<br />
                  student1@school1.edu.np<br />
                  <Typography component="span" sx={{ fontSize: "0.625rem", color: "text.secondary" }}>
                    Password: password123
                  </Typography>
                </Typography>
              </Box>
            </MotionBox>
          </Grid>
        </Grid>
      </Box>

      {/* Mobile Features */}
      {isMobile && (
        <Box sx={{ bgcolor: "background.paper", py: 5, px: 2, borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, textAlign: "center" }}>
            {t("public.features.title")}
          </Typography>
          <Grid container spacing={1.5}>
            {features.map((f, i) => (
              <Grid size={{ xs: 6 }} key={f.key}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid var(--color-border-tertiary)",
                    textAlign: "center",
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: alpha(f.color, 0.1),
                      color: f.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 1,
                      "& .MuiSvgIcon-root": { fontSize: 18 },
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, mb: 0.25 }}>
                    {t(`public.features.${f.key}.title`)}
                  </Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                    {t(`public.features.${f.key}.desc`)}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ py: 3, textAlign: "center", borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
        <Typography variant="caption" color="text.secondary">
          {t("public.footer", { year: new Date().getFullYear() })}
        </Typography>
      </Box>
    </Box>
  );
}
