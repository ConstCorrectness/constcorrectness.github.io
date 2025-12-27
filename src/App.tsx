import React from 'react';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import { Layout } from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { ModelViewer } from './components/ModelViewer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const App: React.FC = () => {
  return (
    <Layout>
      <Box sx={{ bgcolor: '#1e1e1e', pt: 8, pb: 8, borderBottom: '1px solid #333' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
            
            <Box sx={{ flex: '1 1 500px' }}>
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
            </Box>

            <Box sx={{ flex: '1 1 500px' }}>
              <Paper elevation={3} sx={{ height: 400, bgcolor: '#121212', borderRadius: 4, overflow: 'hidden', border: '1px solid #333' }}>
                <ErrorBoundary>
                  <ModelViewer modelUrl="/models/HorribleRoom.glb" />
                </ErrorBoundary>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Dashboard Section */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Latest Dashboard</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <Paper sx={{ p: 3, bgcolor: '#252525', color: 'white' }}>
              <Typography variant="h6" color="#61dafb">Project Alpha</Typography>
              <Typography variant="body2" color="gray">Implementing a custom rendering engine.</Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 300px' }}>
            <Paper sx={{ p: 3, bgcolor: '#252525', color: 'white' }}>
              <Typography variant="h6" color="#61dafb">Jupyter Integration</Typography>
              <Typography variant="body2" color="gray">Automating Python to HTML conversion.</Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 300px' }}>
            <Paper sx={{ p: 3, bgcolor: '#252525', color: 'white' }}>
              <Typography variant="h6" color="#61dafb">Asset Pipeline</Typography>
              <Typography variant="body2" color="gray">Optimizing GLTF files.</Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
}
export default App;