import React, { Suspense, useMemo } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Divider,
  Chip,
  Stack,
  Skeleton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MDXProvider } from '@mdx-js/react';
import 'katex/dist/katex.min.css';
import ReadingProgressBar from '../components/ReadingProgressBar';
import TableOfContents from '../components/TableOfContents';
import GiscusComments from '../components/GiscusComments';
import { notes as notesData } from '../data/notes';

// Define the glob for MDX files
const modules = import.meta.glob('../content/notes/*.mdx');

const components = {
  h1: (props: any) => <Typography variant="h3" component="h1" gutterBottom sx={{ mt: 6, fontWeight: 800 }} {...props} />,
  h2: (props: any) => <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 5, mb: 2, fontWeight: 700 }} {...props} />,
  h3: (props: any) => <Typography variant="h5" component="h3" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }} {...props} />,
  p: (props: any) => <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }} {...props} />,
  li: (props: any) => <Typography component="li" variant="body1" sx={{ mb: 1, color: 'text.secondary' }} {...props} />,
  a: (props: any) => <Typography component="a" variant="body1" color="primary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }} {...props} />,
  blockquote: (props: any) => (
    <Box 
      component="blockquote" 
      sx={{ 
        borderLeft: '4px solid', 
        borderColor: 'primary.main', 
        pl: 3, 
        py: 1, 
        my: 4, 
        bgcolor: 'action.hover',
        borderRadius: '0 8px 8px 0'
      }} 
      {...props} 
    />
  ),
};

// Create a registry of lazy-loaded components
const noteComponents: Record<string, React.LazyExoticComponent<any>> = Object.fromEntries(
  Object.entries(modules).map(([path, loader]) => {
    const slug = path.split('/').pop()?.replace('.mdx', '') || '';
    return [slug, React.lazy(loader as any)];
  })
);

const NoteView: React.FC = () => {
  const { slug } = useParams();
  
  const noteInfo = useMemo(() => notesData.find(n => n.slug === slug), [slug]);
  const NoteContent = slug ? noteComponents[slug] : null;

  if (!noteInfo || !NoteContent) {
    return (
        <Container sx={{ mt: 10, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>Note not found</Typography>
            <Button component={RouterLink} to="/notes" variant="contained" sx={{ mt: 2 }}>
              Back to Blog
            </Button>
        </Container>
    );
  }

  return (
    <>
      <ReadingProgressBar />
      <Container maxWidth="lg" sx={{ pt: 6, pb: 10 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={RouterLink} 
          to="/notes" 
          sx={{ mb: 6, color: 'text.secondary' }}
        >
          Back to list
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Box sx={{ flexGrow: 1, maxWidth: '100%', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
                {noteInfo.title}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  {new Date(noteInfo.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Typography variant="subtitle1" color="text.secondary">
                  {noteInfo.category}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {noteInfo.tags.map(tag => (
                  <Chip key={tag} label={tag} variant="outlined" size="small" />
                ))}
              </Stack>
            </Box>

            <Divider sx={{ mb: 6 }} />

            {/* Content */}
            <Box id="note-content" sx={{ 
                '& pre': { 
                  borderRadius: 2, 
                  p: 2, 
                  my: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  overflowX: 'auto'
                },
                '& code': { 
                  fontFamily: 'monospace',
                  fontSize: '0.9em',
                  bgcolor: 'action.hover',
                  p: '2px 4px',
                  borderRadius: 1
                },
                '& pre code': {
                  bgcolor: 'transparent',
                  p: 0
                },
                '& img': {
                  maxWidth: '100%',
                  borderRadius: 2,
                  my: 4
                }
            }}>
              <MDXProvider components={components}>
                <Suspense fallback={
                  <Box>
                    <Skeleton variant="text" height={40} width="60%" />
                    <Skeleton variant="rectangular" height={200} sx={{ my: 4, borderRadius: 2 }} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={20} width="80%" />
                  </Box>
                }>
                  <NoteContent />
                </Suspense>
              </MDXProvider>
            </Box>

            <GiscusComments />
          </Box>

          <TableOfContents containerId="note-content" />
        </Box>
      </Container>
    </>
  );
};

export default NoteView;
