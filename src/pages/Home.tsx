import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Chip, 
  Grid,
  Stack,
  Divider,
  useTheme
} from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import { ModelViewer } from '../components/ModelViewer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';
import { notes } from '../data/notes';

const Home: React.FC = () => {
  const theme = useTheme();
  const featuredNotes = notes.slice(0, 3);

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'background.paper', 
          pt: { xs: 8, md: 12 }, 
          pb: { xs: 8, md: 12 }, 
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="overline" color="primary" sx={{ letterSpacing: 3, fontWeight: 700 }}>
                BLOG & INTERACTIVE NOTES
              </Typography>
              <Typography variant="h1" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '3rem', md: '4.5rem' } }}>
                const <span style={{ color: theme.palette.primary.main }}>correctness</span>;
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 5, lineHeight: 1.6, fontWeight: 400 }}>
                Explorable explanations at the intersection of AI interpretability, computer graphics, and software engineering.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  size="large" 
                  endIcon={<ArrowForwardIcon />}
                  component={Link}
                  to="/notes"
                  sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                  Explore the Blog
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  component="a"
                  href="https://github.com/constcorrectness"
                  target="_blank"
                  sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                >
                  GitHub
                </Button>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  height: { xs: 350, md: 500 }, 
                  bgcolor: 'action.hover', 
                  borderRadius: 6, 
                  overflow: 'hidden', 
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'relative'
                }}
              >
                <ErrorBoundary>
                  <ModelViewer modelUrl="/models/HorribleRoom.glb" />
                </ErrorBoundary>
                <Box sx={{ position: 'absolute', bottom: 16, right: 16, pointerEvents: 'none' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ bgcolor: 'background.paper', px: 1, py: 0.5, borderRadius: 1, opacity: 0.8 }}>
                    Drag to rotate 3D view
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 6 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>Featured Notes</Typography>
            <Typography variant="h6" color="text.secondary">The latest deep dives into technical topics.</Typography>
          </Box>
          <Button component={Link} to="/notes" endIcon={<ArrowForwardIcon />} sx={{ fontWeight: 700 }}>
            View All
          </Button>
        </Stack>
        
        <Grid container spacing={4}>
          {featuredNotes.map((note) => (
            <Grid item xs={12} md={4} key={note.slug}>
              <Paper 
                elevation={0}
                component={Link}
                to={`/notes/${note.slug}`}
                sx={{ 
                  p: 4, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'background.paper', 
                  border: '1px solid',
                  borderColor: 'divider',
                  textDecoration: 'none',
                  color: 'inherit',
                  borderRadius: 4,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { 
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[10],
                    borderColor: 'primary.main'
                  },
                }}
              >
                <Typography variant="caption" color="primary" sx={{ fontWeight: 800, mb: 1, textTransform: 'uppercase' }}>
                  {note.category}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                  {note.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                  {note.excerpt}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {note.tags.slice(0, 2).map(tag => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                  ))}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* About Section */}
      <Box sx={{ bgcolor: 'action.hover', py: 12 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 3 }}>The Philosophy</Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 6, lineHeight: 1.8 }}>
            I believe that complex technical concepts are best understood through 
            <strong> interaction</strong>. This site is a playground where mathematics, 
            AI architectures, and low-level code come to life through WASM, WebGL, and React.
          </Typography>
          <Divider sx={{ mb: 6, width: 100, mx: 'auto', borderBottomWidth: 4, borderColor: 'primary.main', borderRadius: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Built with ❤️ using React, TypeScript, Material-UI, and Three.js.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default Home;
