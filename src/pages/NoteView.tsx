import React, { Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PythonProvider } from 'react-py';
import 'katex/dist/katex.min.css'; // Import KaTeX styles
import 'highlight.js/styles/github-dark.css'; // Import Highlight.js styles

// Define the glob for MDX files
const modules = import.meta.glob('../content/notes/*.mdx');

const NoteView: React.FC = () => {
  const { slug } = useParams();
  
  // Robustly find the module that matches the slug
  const moduleEntry = Object.entries(modules).find(([path]) => path.endsWith(`/${slug}.mdx`));
  const loader = moduleEntry?.[1];

  if (!loader) {
    return (
        <Container sx={{ mt: 10 }}>
            <Typography variant="h4">Note not found</Typography>
            <Typography color="gray" sx={{ mt: 1 }}>Debug: looked for {slug}.mdx</Typography>
            <Button component={Link} to="/notes" sx={{ mt: 2 }}>Back to Notes</Button>
        </Container>
    );
  }

  const NoteContent = React.useMemo(() => React.lazy(loader as any), [loader]);

  return (
    <PythonProvider>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
        <Button startIcon={<ArrowBackIcon />} component={Link} to="/notes" sx={{ mb: 4, color: 'gray' }}>
          Back to list
        </Button>
        <Box sx={{ 
            bgcolor: '#1e1e1e', 
            p: 6, 
            borderRadius: 2,
            '& pre': { borderRadius: 2, p: 0, overflow: 'hidden' }, // Reset pre styles for syntax highlighter
            '& h1': { fontSize: '2.5rem', fontWeight: 800, mb: 3, color: '#61dafb' },
            '& h2': { fontSize: '1.75rem', fontWeight: 700, mt: 4, mb: 2, borderBottom: '1px solid #333', pb: 1 },
            '& p': { fontSize: '1.1rem', lineHeight: 1.7, mb: 2, color: '#e0e0e0' },
            '& code': { fontSize: '0.9em' }
        }}>
          <Suspense fallback={<div>Loading note...</div>}>
            <NoteContent />
          </Suspense>
        </Box>
      </Container>
    </PythonProvider>
  );
};

export default NoteView;
