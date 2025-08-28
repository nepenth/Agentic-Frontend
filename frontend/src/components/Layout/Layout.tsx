import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface LayoutProps {
  children: React.ReactNode;
  drawerWidth?: number;
}

const Layout: React.FC<LayoutProps> = ({ children, drawerWidth = 280 }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <TopBar drawerWidth={drawerWidth} />
      <Sidebar drawerWidth={drawerWidth} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar /> {/* This creates space for the fixed AppBar */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;