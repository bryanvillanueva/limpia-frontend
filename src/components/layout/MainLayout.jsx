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
          p: { xs: 1.5, sm: 2, md: 3 },
          pb: { xs: 'calc(24px + env(safe-area-inset-bottom))', md: 3 },
          minWidth: 0, // let wide tables scroll inside instead of stretching the page
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar sx={{ mt: 'env(safe-area-inset-top)' }} /> {/* spacer for AppBar height */}
        <Outlet />
      </Box>
    </Box>
  );
}
