import { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { BreadcrumbContext } from "./AppBreadcrumb";

export default function AppLayout() {
  const [overrides, setOverrides] = useState({});

  return (
    <BreadcrumbContext.Provider value={{ overrides, setOverrides }}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: 0,
            pb: "22px",
            px: "22px",
            bgcolor: "var(--color-background-tertiary)",
            minHeight: "100vh",
            overflow: "auto",
          }}
        >
          <Header />
          <Outlet />
        </Box>
      </Box>
    </BreadcrumbContext.Provider>
  );
}
