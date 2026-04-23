import React, { useEffect, useState } from 'react';
import { Box, LinearProgress } from '@mui/material';

const ReadingProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setProgress(Number((currentProgress / scrollHeight).toFixed(2)) * 100);
      }
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        top: (theme) => theme.mixins.toolbar.minHeight, // Adjust based on AppBar height
        left: 0, 
        width: '100%', 
        zIndex: 1100 
      }}
    >
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ 
          height: 4, 
          bgcolor: 'transparent',
          '& .MuiLinearProgress-bar': {
            borderRadius: 2
          }
        }} 
      />
    </Box>
  );
};

export default ReadingProgressBar;
