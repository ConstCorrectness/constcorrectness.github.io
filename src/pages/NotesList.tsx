import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const notes = [
  { slug: 'anatomy-of-multi-head-attention', title: 'The Anatomy of Multi-Head Attention' },
  { slug: 'rendering-math', title: '3D Projection Mathematics' },
  { slug: 'const-correctness', title: 'The Philosophy of Const Correctness' }
];

const NotesList: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Typography variant="h3" sx={{ mb: 6, fontWeight: 'bold', color: '#61dafb' }}>
        Notes
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {notes.map((note) => (
          <Paper 
            key={note.slug} 
            component={Link} 
            to={`/notes/${note.slug}`}
            sx={{ 
              p: 4, 
              bgcolor: '#1e1e1e', 
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': { bgcolor: '#252525' }
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{note.title}</Typography>
          </Paper>
        ))}
      </Box>
    </Container>
  );
};

export default NotesList;
