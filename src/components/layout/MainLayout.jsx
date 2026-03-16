import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

const DRAWER_WIDTH = 260;

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Topbar onMenuClick={() => setMobileOpen(true)} />

      {/* Desktop permanent sidebar */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Sidebar variant="permanent" />
      </Box>

      {/* Mobile temporary sidebar */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Sidebar
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar /> {/* spacer for AppBar height */}
        <Outlet />
      </Box>
    </Box>
  );
}
