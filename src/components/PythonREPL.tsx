import React, { useEffect, useState } from 'react';
import { usePython } from 'react-py';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

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
    <Box sx={{ my: 4, border: '1px solid #444', borderRadius: 2, overflow: 'hidden' }}>
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
            Run
        </Button>
      </Box>
      <Box component="pre" sx={{ m: 0, p: 2, bgcolor: '#1e1e1e', overflowX: 'auto', fontSize: '0.9rem', fontFamily: 'monospace' }}>
        <code>{initialCode}</code>
      </Box>
      {output.length > 0 && (
        <Box sx={{ p: 2, bgcolor: '#000', borderTop: '1px solid #444' }}>
            <Typography variant="overline" color="gray">Output:</Typography>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#4caf50' }}>
                {output.join('\n')}
            </pre>
        </Box>
      )}
    </Box>
  );
};
