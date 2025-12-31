import React, { useState } from 'react';
import { Container, Typography, Paper, Box, Button, Chip } from '@mui/material';
import { Layout } from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { ModelViewer } from './components/ModelViewer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


export interface ProjectCard {
  title: string;
  description: string;
  status: 'active' | 'maintenance' | 'deprecated';
  href?: string;
}

// Data source (eventually fetched from API)
const INITIAL_DASHBOARD: ProjectCard[] = [
  { title: "Project Alpha", description: "Implementing a custom rendering engine.", status: "active" },
  { 
    title: "Jupyter Integration", 
    description: "Automating Python to HTML conversion.", 
    status: "active",
    href: "/notes/rendering-math.html"
  },
  { title: "Asset Pipeline", description: "Optimizing GLTF files.", status: "maintenance" }
];


const App: React.FC = () => {
  // We use state now, so we can eventually update this from an API
  const [projects] = useState<ProjectCard[]>(INITIAL_DASHBOARD);

  // Helper to color-code status chips
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'deprecated': return 'error';
      default: return 'default';
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <Box sx={{ bgcolor: '#1e1e1e', pt: 8, pb: 8, borderBottom: '1px solid #333' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
            <Box sx={{ flex: '1 1 500px' }}>
              <Typography variant="overline" color="#61dafb" sx={{ letterSpacing: 2 }}>
                Docs
              </Typography>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
                T const * const ConstCorrectness {'{ }'}
              </Typography>
              <Typography variant="h6" color="gray" sx={{ mb: 4, lineHeight: 1.6 }}>
                Random Thoughts.... 
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

      {/* Dynamic Dashboard Section */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Stuff</Typography>
        
        {/* The Grid Layout */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          {projects.map((item, index) => (
            <Paper 
              key={index} 
              component={item.href ? 'a' : 'div'}
              href={item.href}
              sx={{ 
                p: 3, 
                bgcolor: '#252525', 
                color: 'white',
                transition: 'transform 0.2s',
                textDecoration: 'none',
                '&:hover': { 
                  transform: item.href ? 'translateY(-4px)' : 'none',
                  boxShadow: item.href ? 6 : 1,
                },
                cursor: item.href ? 'pointer' : 'default',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" color="#61dafb">
                  {item.title}
                </Typography>
                <Chip 
                  label={item.status} 
                  size="small" 
                  color={getStatusColor(item.status) as any} 
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }} 
                />
              </Box>
              <Typography variant="body2" color="gray">
                {item.description}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    </Layout>
  );
}

export default App;