import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CodeIcon from '@mui/icons-material/Code';
import { Alert, Box, Button, Collapse, Paper, Stack, Typography } from '@mui/material';
import React, { useEffect, useId, useState } from 'react';

type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, definition: string) => Promise<{ svg: string; bindFunctions?: (element: Element) => void }>;
};

declare global {
  interface Window {
    mermaid?: MermaidApi;
    __mermaidLoader?: Promise<MermaidApi>;
  }
}

const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';

const loadMermaid = (): Promise<MermaidApi> => {
  if (window.mermaid) return Promise.resolve(window.mermaid);
  if (window.__mermaidLoader) return window.__mermaidLoader;

  window.__mermaidLoader = new Promise<MermaidApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = MERMAID_CDN;
    script.async = true;
    script.onload = () => {
      if (!window.mermaid) {
        reject(new Error('Mermaid did not initialise.'));
        return;
      }
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        deterministicIds: true,
        theme: 'base',
        themeVariables: {
          primaryColor: '#e0f2fe',
          primaryTextColor: '#082f49',
          primaryBorderColor: '#0284c7',
          lineColor: '#64748b',
          secondaryColor: '#f5f3ff',
          tertiaryColor: '#ecfeff',
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' }
      });
      resolve(window.mermaid);
    };
    script.onerror = () => reject(new Error('The Mermaid diagram library could not be loaded.'));
    document.head.appendChild(script);
  });
  return window.__mermaidLoader;
};

interface MermaidDiagramProps {
  chart: string;
  title: string;
  caption?: string;
}

/** Render a Mermaid definition and retain the source as an inspectable fallback. */
const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, title, caption }) => {
  const reactId = useId().replace(/:/g, '');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [showSource, setShowSource] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      try {
        const mermaid = await loadMermaid();
        const result = await mermaid.render(`gemma-mermaid-${reactId}`, chart.trim());
        if (!cancelled) setSvg(result.svg);
      } catch (renderError) {
        if (!cancelled) {
          setError(renderError instanceof Error ? renderError.message : 'Unable to render diagram.');
          setShowSource(true);
        }
      }
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  const copySource = async () => {
    try {
      await navigator.clipboard.writeText(chart.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Could not copy the Mermaid source from this browser.');
    }
  };

  return (
    <Paper component="figure" variant="outlined" sx={{ m: 0, my: 3, overflow: 'hidden', borderRadius: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ px: 2, py: 1.5, bgcolor: 'action.hover' }}>
        <Box>
          <Typography component="h4" variant="subtitle1" fontWeight={800}>{title}</Typography>
          {caption && <Typography variant="caption" color="text.secondary">{caption}</Typography>}
        </Box>
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<CodeIcon />} onClick={() => setShowSource((value) => !value)}>
            {showSource ? 'Hide source' : 'View source'}
          </Button>
          <Button size="small" startIcon={<ContentCopyIcon />} onClick={copySource}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </Stack>
      </Stack>
      <Box sx={{ p: { xs: 1.5, sm: 3 }, overflowX: 'auto', '& svg': { minWidth: 520, maxWidth: '100%', height: 'auto' } }}>
        {svg ? <Box aria-label={title} dangerouslySetInnerHTML={{ __html: svg }} /> : !error && <Typography color="text.secondary">Drawing diagram…</Typography>}
        {error && <Alert severity="info">{error} The Mermaid definition remains available below.</Alert>}
      </Box>
      <Collapse in={showSource}>
        <Box component="pre" sx={{ m: 0, p: 2, overflowX: 'auto', borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default', fontSize: '0.8rem' }}>
          <code>{chart.trim()}</code>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default MermaidDiagram;
