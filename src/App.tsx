import React from 'react';
import { Container, Typography, Paper, Box, Button, Grid } from '@mui/material'; // Standard Grid import
import { Layout } from './components/Layout';
import { ModelViewer } from './components/ModelViewer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const App: React.FC = () => {
  return (
    <Layout>
      {/* --- HERO SECTION --- */}
      <Box sx={{ bgcolor: '#1e1e1e', pt: 8, pb: 8, borderBottom: '1px solid #333' }}>
        <Container maxWidth="xl">
          {/* Standard Grid requires 'container' on the parent */}
          <Grid container spacing={4} alignItems="center">
            
            {/* Standard Grid requires 'item' on the children */}
            <Grid item xs={12} md={6}>
              <Typography variant="overline" color="#61dafb" sx={{ letterSpacing: 2 }}>
                Portfolio & Documentation
              </Typography>
              <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
                Rendering Reality.
              </Typography>
              <Typography variant="h6" color="gray" sx={{ mb: 4, lineHeight: 1.6 }}>
                Welcome to my digital workspace. I write about high-performance C++, 
                const correctness, and interactive 3D web experiences.
              </Typography>
              <Button 
                variant="contained" 
                size="large" 
                endIcon={<ArrowForwardIcon />}
                href="/notes/index.html"
                sx={{ bgcolor: '#61dafb', color: '#000', fontWeight: 'bold' }}
              >
                Read the Notes
              </Button>
            </Grid>

            {/* Right: 3D Viewer */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={3} 
                sx={{ 
                  height: 400, 
                  bgcolor: '#121212', 
                  borderRadius: 4, 
                  overflow: 'hidden',
                  border: '1px solid #333'
                }}
              >
                <ModelViewer modelUrl="/models/HorribleRoom.glb" />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- DASHBOARD / LATEST UPDATES --- */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Latest Dashboard
        </Typography>
        <Grid container spacing={3}>
          {/* Card 1 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, bgcolor: '#252525', color: 'white' }}>
              <Typography variant="h6" gutterBottom color="#61dafb">Project Alpha</Typography>
              <Typography variant="body2" color="gray">
                Implementing a custom rendering engine using Vulkan and C++.
              </Typography>
            </Paper>
          </Grid>
          
          {/* Card 2 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, bgcolor: '#252525', color: 'white' }}>
              <Typography variant="h6" gutterBottom color="#61dafb">Jupyter Integration</Typography>
              <Typography variant="body2" color="gray">
                Automating CI/CD pipelines to convert Python notebooks into static HTML.
              </Typography>
            </Paper>
          </Grid>

          {/* Card 3 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, bgcolor: '#252525', color: 'white' }}>
              <Typography variant="h6" gutterBottom color="#61dafb">Asset Pipeline</Typography>
              <Typography variant="body2" color="gray">
                Optimizing GLTF files for faster loading on React clients.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
}

export default App;