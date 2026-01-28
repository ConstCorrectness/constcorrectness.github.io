import React, { useEffect, useState } from 'react';
import { usePython } from 'react-py';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PythonREPLProps {
  code: string;
  packages?: string[];
}

export const PythonREPL: React.FC<PythonREPLProps> = ({ code: initialCode, packages = [] }) => {
  const { runPython, stdout, stderr, isLoading, isRunning } = usePython({ packages: { official: packages } });
  const [output, setOutput] = useState<string[]>([]);

  useEffect(() => {
    if (stdout) setOutput((prev) => [...prev, stdout]);
  }, [stdout]);

  useEffect(() => {
    if (stderr) setOutput((prev) => [...prev, `Error: ${stderr}`]);
  }, [stderr]);

  return (
    <Box sx={{ my: 4, border: '1px solid #444', borderRadius: 2, overflow: 'hidden', bgcolor: '#1e1e1e' }}>
      <Box sx={{ bgcolor: '#2d2d2d', p: 1, borderBottom: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ color: '#aaa', ml: 1 }}>Python 3 (WASM)</Typography>
        <Button 
            size="small" 
            variant="contained" 
            color="success" 
            startIcon={isRunning ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
            onClick={() => {
                setOutput([]);
                runPython(initialCode);
            }}
            disabled={isLoading || isRunning}
        >
            {isRunning ? 'Running...' : 'Run'}
        </Button>
      </Box>
      
      <SyntaxHighlighter 
        language="python" 
        style={atomDark}
        customStyle={{ 
            margin: 0, 
            padding: '1.5rem', 
            fontSize: '0.95rem',
            backgroundColor: 'transparent'
        }}
      >
        {initialCode.trim()}
      </SyntaxHighlighter>

      {output.length > 0 && (
        <Box sx={{ p: 2, bgcolor: '#000', borderTop: '1px solid #444' }}>
            <Typography variant="overline" color="gray">Output:</Typography>
            <Box component="pre" sx={{ m: 0, mt: 1, whiteSpace: 'pre-wrap', color: '#4caf50', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {output.join('\n')}
            </Box>
        </Box>
      )}
    </Box>
  );
};
