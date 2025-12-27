import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, Box, Container, Link } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CodeIcon from '@mui/icons-material/Code';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Dropdown State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#121212', color: 'white' }}>
      
      {/* --- HEADER --- */}
      <AppBar position="static" sx={{ bgcolor: '#1e1e1e', borderBottom: '1px solid #333' }}>
        <Toolbar>
          <CodeIcon sx={{ mr: 1, color: '#61dafb' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'monospace', fontWeight: 700 }}>
            const correctness;
          </Typography>

          <Button color="inherit" href="/">Home</Button>
          
          {/* Blog Dropdown */}
          <Button 
            color="inherit" 
            endIcon={<KeyboardArrowDownIcon />}
            onClick={handleMenuClick}
          >
            Blog
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            {/* These link to your rendered Jupyter Book pages */}
            <MenuItem onClick={handleClose} component="a" href="/notes/index.html">
              Intro & Setup
            </MenuItem>
            <MenuItem onClick={handleClose} component="a" href="/notes/structure.html">
              C++ Deep Dives
            </MenuItem>
          </Menu>

          <Button color="inherit" href="https://github.com/constcorrectness">GitHub</Button>
        </Toolbar>
      </AppBar>

      {/* --- MAIN CONTENT --- */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      {/* --- FOOTER --- */}
      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: '#0a0a0a', textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="#888">
            © {new Date().getFullYear()}  ConstCorrectness ™️
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};