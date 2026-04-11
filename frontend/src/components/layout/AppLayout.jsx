import { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar, { SIDEBAR_WIDTH } from "./Sidebar";
import Header from "./Header";
import { BreadcrumbContext } from "./AppBreadcrumb";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export default function AppLayout() {
  const [overrides, setOverrides] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <BreadcrumbContext.Provider value={{ overrides, setOverrides }}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: 0,
            pb: 3,
            px: { xs: 2, sm: 3 },
            bgcolor: "background.default",
            minHeight: "100vh",
            overflow: "auto",
            width: isMobile ? "100%" : `calc(100% - ${SIDEBAR_WIDTH}px)`,
          }}
        >
          <Header
            onMenuClick={isMobile ? () => setMobileOpen(true) : undefined}
          />
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Box>
      </Box>
    </BreadcrumbContext.Provider>
  );
}
