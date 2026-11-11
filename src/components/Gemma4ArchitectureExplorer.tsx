import MemoryIcon from '@mui/icons-material/Memory';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import { Box, ButtonBase, Chip, Divider, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';

type ArchitectureId = 'efficient' | 'unified' | 'moe' | 'dense';
type Precision = 'BF16' | 'SFP8' | 'Q4_0' | 'Mobile';

type Stage = { id: string; label: string; short: string; detail: string; tone: string };

type Architecture = {
  id: ArchitectureId;
  name: string;
  sizes: string;
  eyebrow: string;
  description: string;
  context: string;
  capabilities: string[];
  stages: Stage[];
};

const architectures: Architecture[] = [
  {
    id: 'efficient',
    name: 'Efficient / PLE',
    sizes: 'E2B · E4B',
    eyebrow: 'Edge and mobile',
    description: 'The small models trade raw parameter count for per-layer embeddings (PLE): each decoder layer can look up its own token embedding without paying the compute cost of a much deeper backbone.',
    context: '128K tokens',
    capabilities: ['Text + image', 'Native audio', 'Per-layer embeddings', 'MTP drafter'],
    stages: [
      { id: 'inputs', label: 'Multimodal input', short: 'Text · image · audio', detail: 'Audio is supported natively on both edge variants; all family members accept text and image inputs.', tone: '#0ea5e9' },
      { id: 'embed', label: 'Token + PLE lookup', short: 'Layer-specific embeddings', detail: 'PLE supplies a lightweight, layer-specific representation for every token. The tables add stored weights, but lookups are inexpensive at inference.', tone: '#14b8a6' },
      { id: 'decoder', label: 'Decoder backbone', short: 'Repeated transformer blocks', detail: 'The causal decoder mixes the context and produces the next-token distribution.', tone: '#6366f1' },
      { id: 'draft', label: 'MTP drafter', short: 'Speculative proposals', detail: 'The dedicated drafter proposes multiple future tokens; the main model verifies them to improve decode throughput.', tone: '#f59e0b' },
      { id: 'output', label: 'Text output', short: 'Next tokens', detail: 'Generation remains autoregressive: accepted tokens are fed back into the context for the next decoding step.', tone: '#ec4899' }
    ]
  },
  {
    id: 'unified',
    name: 'Unified',
    sizes: '12B',
    eyebrow: 'Encoder-free multimodality',
    description: 'The 12B model puts text, visual, and audio representations into one token space with lightweight projections, then lets the shared LLM backbone do the multimodal reasoning.',
    context: '256K tokens',
    capabilities: ['Text + image + audio', 'Single vision projection', 'Raw-audio projection', 'MTP drafter'],
    stages: [
      { id: 'inputs', label: 'Three input streams', short: 'Text · image · audio', detail: 'Inputs can be interleaved. For prompt construction, image content is placed before text and audio after text.', tone: '#0ea5e9' },
      { id: 'project', label: 'Direct projections', short: 'No separate encoders', detail: 'Vision uses a single matrix multiplication with positional embeddings and normalisation. Audio is projected from its raw signal into the text-token space.', tone: '#14b8a6' },
      { id: 'shared', label: 'Shared token stream', short: 'One sequence', detail: 'Projected image and audio features join normal text embeddings as a single sequence.', tone: '#8b5cf6' },
      { id: 'decoder', label: 'LLM backbone', short: 'Multimodal reasoning', detail: 'The decoder receives one unified sequence, avoiding dedicated vision or audio encoder stacks.', tone: '#6366f1' },
      { id: 'output', label: 'Text output', short: 'Answer or tool call', detail: 'The model emits text and can produce structured function calls for agentic workflows.', tone: '#ec4899' }
    ]
  },
  {
    id: 'moe',
    name: 'Mixture of Experts',
    sizes: '26B A4B',
    eyebrow: 'High throughput reasoning',
    description: 'The MoE variant keeps a large bank of expert weights available, but routes each token through only a small active subset. “A4B” describes its roughly 4B active-parameter footprint per token, not its loaded-weight requirement.',
    context: '256K tokens',
    capabilities: ['Text + image', '26B total weights', '~4B active / token', 'MTP drafter'],
    stages: [
      { id: 'inputs', label: 'Embedded input', short: 'Text · image features', detail: 'The model receives a sequence of text tokens and visual features, then processes it autoregressively.', tone: '#0ea5e9' },
      { id: 'attention', label: 'Attention block', short: 'Share context', detail: 'Attention makes the current token representation context-aware before feed-forward computation.', tone: '#6366f1' },
      { id: 'router', label: 'Router', short: 'Score experts', detail: 'A learned router selects a small set of specialist feed-forward paths for each token.', tone: '#f59e0b' },
      { id: 'experts', label: 'Selected experts', short: 'Sparse compute', detail: 'Only selected experts execute for a token, which lowers active compute while retaining a larger total parameter pool.', tone: '#14b8a6' },
      { id: 'output', label: 'Combine + decode', short: 'Weighted result', detail: 'The selected expert outputs are combined and passed to later transformer layers and the output head.', tone: '#ec4899' }
    ]
  },
  {
    id: 'dense',
    name: 'Dense',
    sizes: '31B',
    eyebrow: 'Maximum quality',
    description: 'The dense 31B model applies the same parameterized feed-forward path to every token in each layer. This makes its compute predictable and prioritizes general-purpose quality over sparse activation.',
    context: '256K tokens',
    capabilities: ['Text + image', '31B active / token', 'Dense FFN', 'MTP drafter'],
    stages: [
      { id: 'inputs', label: 'Embedded input', short: 'Text · image features', detail: 'Text and image content are represented as a sequence for the decoder.', tone: '#0ea5e9' },
      { id: 'attention', label: 'Self-attention', short: 'Context mixing', detail: 'Each decoder block attends over the causal context to exchange information across tokens.', tone: '#6366f1' },
      { id: 'ffn', label: 'Dense feed-forward', short: 'Every parameter path', detail: 'Every token passes through the layer’s full feed-forward network rather than a selected expert subset.', tone: '#8b5cf6' },
      { id: 'repeat', label: 'Repeat blocks', short: 'Deep stack', detail: 'Attention and dense computation repeat through the backbone before the language-model head.', tone: '#14b8a6' },
      { id: 'output', label: 'Text output', short: 'Next-token logits', detail: 'The output head scores the vocabulary and sampling selects the next token.', tone: '#ec4899' }
    ]
  }
];

type MemoryEntry = {
  architecture: ArchitectureId;
  BF16: number;
  SFP8: number;
  Q4_0: number;
  Mobile?: number;
};

const memory: Record<string, MemoryEntry> = {
  E2B: { architecture: 'efficient' as ArchitectureId, BF16: 11.4, SFP8: 5.7, Q4_0: 2.9, Mobile: 1.1 },
  E4B: { architecture: 'efficient' as ArchitectureId, BF16: 17.9, SFP8: 8.9, Q4_0: 4.5, Mobile: 2.5 },
  '12B': { architecture: 'unified' as ArchitectureId, BF16: 26.7, SFP8: 13.4, Q4_0: 6.7 },
  '26B A4B': { architecture: 'moe' as ArchitectureId, BF16: 57.7, SFP8: 28.8, Q4_0: 14.4 },
  '31B': { architecture: 'dense' as ArchitectureId, BF16: 69.9, SFP8: 34.9, Q4_0: 17.5 }
};

const Gemma4ArchitectureExplorer: React.FC = () => {
  const [architectureId, setArchitectureId] = useState<ArchitectureId>('efficient');
  const [activeStage, setActiveStage] = useState('embed');
  const [precision, setPrecision] = useState<Precision>('Q4_0');
  const architecture = useMemo(() => architectures.find((item) => item.id === architectureId) ?? architectures[0], [architectureId]);
  const selectedStage = architecture.stages.find((stage) => stage.id === activeStage) ?? architecture.stages[0];
  const visibleMemory = Object.entries(memory).filter(([, value]) => value[precision] !== undefined);

  const chooseArchitecture = (id: ArchitectureId) => {
    const next = architectures.find((item) => item.id === id) ?? architectures[0];
    setArchitectureId(id);
    setActiveStage(next.stages[Math.min(1, next.stages.length - 1)].id);
  };

  return (
    <Box component="section" aria-label="Interactive Gemma 4 architecture explorer" sx={{ my: 5 }}>
      <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 4, borderColor: 'primary.light' }}>
        <Box sx={{ p: { xs: 2.5, md: 4 }, background: 'linear-gradient(135deg, rgba(14,165,233,.12), rgba(99,102,241,.10) 55%, rgba(236,72,153,.08))' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'end' }} spacing={2}>
            <Box>
              <Typography variant="overline" color="primary.main" fontWeight={800}>Interactive architecture map</Typography>
              <Typography variant="h4" component="h2" sx={{ mt: 0.5, fontWeight: 800 }}>Pick a Gemma 4 design</Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 720, mt: 1 }}>Click a family, then click any coloured stage to inspect the architectural decision behind it.</Typography>
            </Box>
            <Chip icon={<TouchAppIcon />} label="Click the blocks" color="primary" variant="outlined" />
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1.25, mt: 3 }}>
            {architectures.map((item) => {
              const selected = item.id === architectureId;
              return (
                <ButtonBase key={item.id} onClick={() => chooseArchitecture(item.id)} aria-pressed={selected} sx={{ textAlign: 'left', borderRadius: 2, display: 'block' }}>
                  <Box sx={{ p: 1.75, width: '100%', minHeight: 116, border: '2px solid', borderColor: selected ? 'primary.main' : 'divider', borderRadius: 2, bgcolor: selected ? 'background.paper' : 'rgba(255,255,255,.45)', boxShadow: selected ? 3 : 0, transition: 'all .18s ease', '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' } }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>{item.eyebrow}</Typography>
                    <Typography variant="subtitle1" fontWeight={800}>{item.name}</Typography>
                    <Typography variant="body2" color="primary.main" fontWeight={700}>{item.sizes}</Typography>
                  </Box>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h5" component="h3" fontWeight={800}>{architecture.name} <Box component="span" color="primary.main">({architecture.sizes})</Box></Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 840 }}>{architecture.description}</Typography>
            </Box>
            <Chip label={architecture.context} color="secondary" variant="outlined" sx={{ alignSelf: { md: 'flex-start' }, fontWeight: 700 }} />
          </Stack>

          <Box aria-label={`${architecture.name} data flow`} sx={{ display: 'flex', alignItems: 'stretch', gap: 0.75, overflowX: 'auto', pb: 1.5 }}>
            {architecture.stages.map((stage, index) => (
              <React.Fragment key={stage.id}>
                <ButtonBase onClick={() => setActiveStage(stage.id)} aria-pressed={selectedStage.id === stage.id} sx={{ flex: '1 0 155px', textAlign: 'left', borderRadius: 2, alignItems: 'stretch' }}>
                  <Box sx={{ width: '100%', minHeight: 122, p: 1.5, borderRadius: 2, border: '2px solid', borderColor: selectedStage.id === stage.id ? stage.tone : 'divider', bgcolor: selectedStage.id === stage.id ? `${stage.tone}16` : 'background.paper', boxShadow: selectedStage.id === stage.id ? 2 : 0, transition: 'all .18s ease', '&:hover': { borderColor: stage.tone } }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: stage.tone, mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight={800}>{stage.label}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{stage.short}</Typography>
                  </Box>
                </ButtonBase>
                {index < architecture.stages.length - 1 && <Typography aria-hidden="true" sx={{ alignSelf: 'center', color: 'text.disabled', fontSize: '1.4rem', px: 0.25 }}>→</Typography>}
              </React.Fragment>
            ))}
          </Box>

          <Paper variant="outlined" sx={{ mt: 1, p: 2, borderLeft: '5px solid', borderLeftColor: selectedStage.tone, bgcolor: 'action.hover' }}>
            <Typography variant="overline" sx={{ color: selectedStage.tone, fontWeight: 800 }}>Selected stage · {selectedStage.label}</Typography>
            <Typography variant="body2" color="text.secondary">{selectedStage.detail}</Typography>
          </Paper>

          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2.5 }}>
            {architecture.capabilities.map((capability) => <Chip key={capability} size="small" label={capability} />)}
          </Stack>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ mt: 3, p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center"><MemoryIcon color="primary" /><Typography variant="h6" component="h3" fontWeight={800}>Weight-memory comparison</Typography></Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Choose a precision to compare approximate static-weight memory. KV cache and runtime overhead beyond the documented loading estimate are not included.</Typography>
          </Box>
          <ToggleButtonGroup size="small" exclusive value={precision} onChange={(_, value: Precision | null) => value && setPrecision(value)} aria-label="Weight precision">
            <ToggleButton value="BF16">BF16</ToggleButton>
            <ToggleButton value="SFP8">SFP8</ToggleButton>
            <ToggleButton value="Q4_0">Q4</ToggleButton>
            <ToggleButton value="Mobile">Mobile</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Divider sx={{ my: 2.5 }} />
        <Stack spacing={1.5}>
          {visibleMemory.map(([name, values]) => {
            const value = values[precision] as number;
            const modelArchitecture = values.architecture;
            return (
              <ButtonBase key={name} onClick={() => chooseArchitecture(modelArchitecture)} sx={{ borderRadius: 1, textAlign: 'left' }}>
                <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: { xs: '72px 1fr 58px', sm: '110px 1fr 64px' }, alignItems: 'center', gap: 1.5, p: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                  <Typography variant="body2" fontWeight={800}>Gemma 4 {name}</Typography>
                  <Box sx={{ height: 22, bgcolor: 'action.hover', borderRadius: 99, overflow: 'hidden' }}><Box sx={{ height: '100%', width: `${Math.max(3, (value / 70) * 100)}%`, borderRadius: 99, background: 'linear-gradient(90deg, #38bdf8, #6366f1)' }} /></Box>
                  <Typography variant="body2" textAlign="right" fontWeight={800}>{value} GB</Typography>
                </Box>
              </ButtonBase>
            );
          })}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>Click a row to jump back to that architecture. The 26B A4B MoE activates about 4B parameters per token, but its full 26B weights still need to be loaded.</Typography>
      </Paper>
    </Box>
  );
};

export default Gemma4ArchitectureExplorer;
