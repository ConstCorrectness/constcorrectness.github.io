import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import { Link as RouterLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      
      {/* --- HEADER --- */}
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          bgcolor: 'background.paper', 
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography 
            variant="h6" 
            component={RouterLink}
            to="/"
            sx={{ 
              flexGrow: 1, 
              fontFamily: 'monospace', 
              fontWeight: 700,
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            const correctness;
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            <Button component={RouterLink} to="/" color="inherit">Home</Button>
            <Button component={RouterLink} to="/notes" color="inherit">Blog</Button>
            <Button component="a" href="https://github.com/constcorrectness" target="_blank" color="inherit">GitHub</Button>
            <ThemeToggle />
          </Box>

          {/* Mobile view could be added here later with a Drawer */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
             <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>

      {/* --- MAIN CONTENT --- */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      {/* --- FOOTER --- */}
      <Box 
        component="footer" 
        sx={{ 
          py: 6, 
          px: 2, 
          mt: 'auto', 
          bgcolor: 'background.paper', 
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center' 
        }}
      >
        <Container maxWidth="md">
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()}  ConstCorrectness ™️
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Built with React, MUI, and Three.js
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};