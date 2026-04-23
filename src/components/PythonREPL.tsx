import React, { useEffect, useState } from 'react';
import { usePython } from 'react-py';
import { Box, Button, CircularProgress, Typography, Paper, useTheme } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PythonREPLProps {
  code: string;
  packages?: string[];
}

export const PythonREPL: React.FC<PythonREPLProps> = ({ code: initialCode, packages = [] }) => {
  const theme = useTheme();
  const { runPython, stdout, stderr, isLoading, isRunning } = usePython({ packages: { official: packages } });
  const [output, setOutput] = useState<string[]>([]);

  useEffect(() => {
    if (stdout) {
      setTimeout(() => setOutput((prev) => [...prev, stdout]), 0);
    }
  }, [stdout]);

  useEffect(() => {
    if (stderr) {
      setTimeout(() => setOutput((prev) => [...prev, `Error: ${stderr}`]), 0);
    }
  }, [stderr]);

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        my: 4, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 2, 
        overflow: 'hidden', 
        bgcolor: 'background.paper' 
      }}
    >
      <Box sx={{ 
        bgcolor: 'action.hover', 
        p: 1.5, 
        borderBottom: '1px solid', 
        borderColor: 'divider', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, ml: 1 }}>
          PYTHON 3 (WASM)
        </Typography>
        <Button 
            size="small" 
            variant="contained" 
            color="primary" 
            startIcon={isRunning ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
            onClick={() => {
                setOutput([]);
                runPython(initialCode);
            }}
            disabled={isLoading || isRunning}
            sx={{ borderRadius: 1.5 }}
        >
            {isRunning ? 'Running...' : 'Run'}
        </Button>
      </Box>
      
      <SyntaxHighlighter 
        language="python" 
        style={theme.palette.mode === 'dark' ? atomDark : prism}
        customStyle={{ 
            margin: 0, 
            padding: '1.5rem', 
            fontSize: '0.9rem',
            backgroundColor: 'transparent'
        }}
      >
        {initialCode.trim()}
      </SyntaxHighlighter>

      {output.length > 0 && (
        <Box sx={{ 
          p: 2, 
          bgcolor: theme.palette.mode === 'dark' ? '#000' : '#f0f0f0', 
          borderTop: '1px solid',
          borderColor: 'divider' 
        }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>Output</Typography>
            <Box component="pre" sx={{ m: 0, mt: 1, whiteSpace: 'pre-wrap', color: theme.palette.mode === 'dark' ? '#4caf50' : '#2e7d32', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {output.join('\n')}
            </Box>
        </Box>
      )}
    </Paper>
  );
};
