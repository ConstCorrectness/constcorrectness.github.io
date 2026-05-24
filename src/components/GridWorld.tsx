import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ROWS = 5;
const COLS = 6;
const WALLS: [number, number][] = [[1, 2], [1, 3], [3, 1], [2, 4]];
const START: [number, number] = [4, 0];
const GOAL: [number, number] = [0, 5];
const ACTIONS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const ARROWS = ['↑', '↓', '←', '→'];

const CELL = 64;
const ALPHA = 0.15;
const GAMMA = 0.95;
const EPISODES = 1000;
const MAX_STEPS = 100;
const SMOOTH_WIN = 50;

const wallSet = new Set(WALLS.map(([r, c]) => `${r},${c}`));
const isWall = (r: number, c: number) => wallSet.has(`${r},${c}`);
const isGoal = (r: number, c: number) => r === GOAL[0] && c === GOAL[1];

type Q = number[][][];

function makeQ(): Q {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => Array(4).fill(0))
  );
}

function envStep(r: number, c: number, a: number): [number, number, number, boolean] {
  const [dr, dc] = ACTIONS[a];
  let nr = r + dr, nc = c + dc;
  if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || isWall(nr, nc)) {
    nr = r; nc = c;
  }
  const done = isGoal(nr, nc);
  return [nr, nc, done ? 10 : -0.1, done];
}

function greedyA(q: Q, r: number, c: number): number {
  return q[r][c].indexOf(Math.max(...q[r][c]));
}

function train(): { q: Q; curve: number[] } {
  const q = makeQ();
  const curve: number[] = [];
  for (let ep = 0; ep < EPISODES; ep++) {
    const eps = 0.05 + 0.95 * Math.exp(-6 * ep / EPISODES);
    let [r, c] = START;
    let G = 0;
    for (let t = 0; t < MAX_STEPS; t++) {
      const a = Math.random() < eps ? Math.floor(Math.random() * 4) : greedyA(q, r, c);
      const [nr, nc, reward, done] = envStep(r, c, a);
      q[r][c][a] += ALPHA * (reward + GAMMA * Math.max(...q[nr][nc]) - q[r][c][a]);
      G += reward;
      r = nr; c = nc;
      if (done) break;
    }
    curve.push(G);
  }
  return { q, curve };
}

function rollout(q: Q): [number, number][] {
  const path: [number, number][] = [[START[0], START[1]]];
  let [r, c] = START;
  const seen = new Set<string>();
  for (let t = 0; t < MAX_STEPS; t++) {
    const k = `${r},${c}`;
    if (seen.has(k)) break;
    seen.add(k);
    const [nr, nc, , done] = envStep(r, c, greedyA(q, r, c));
    r = nr; c = nc;
    path.push([r, c]);
    if (done) break;
  }
  return path;
}

function smooth(arr: number[]): number[] {
  return arr.map((_, i) => {
    const s = arr.slice(Math.max(0, i - SMOOTH_WIN), i + 1);
    return s.reduce((a, b) => a + b, 0) / s.length;
  });
}

export default function GridWorld() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [q, setQ] = useState<Q | null>(null);
  const [curve, setCurve] = useState<number[]>([]);
  const [status, setStatus] = useState<'idle' | 'training' | 'ready'>('idle');
  const [agentPos, setAgentPos] = useState<[number, number]>(START);
  const [playing, setPlaying] = useState(false);
  const [path, setPath] = useState<[number, number][]>([]);
  const [pathIdx, setPathIdx] = useState(0);

  const handleTrain = useCallback(() => {
    setStatus('training');
    setQ(null);
    setCurve([]);
    setAgentPos(START);
    setPlaying(false);
    setTimeout(() => {
      const result = train();
      setQ(result.q);
      setCurve(result.curve);
      setStatus('ready');
    }, 30);
  }, []);

  const handlePlay = useCallback(() => {
    if (!q || playing) return;
    const p = rollout(q);
    setPath(p);
    setPathIdx(0);
    setAgentPos(p[0]);
    setPlaying(true);
  }, [q, playing]);

  useEffect(() => {
    if (!playing || path.length === 0) return;
    const timer = setTimeout(() => {
      const next = pathIdx + 1;
      if (next >= path.length) {
        setPlaying(false);
      } else {
        setPathIdx(next);
        setAgentPos(path[next]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [playing, pathIdx, path]);

  const chartW = COLS * CELL;
  const chartH = 70;
  const smoothed = smooth(curve);
  const minR = Math.min(...smoothed, -1);
  const maxR = Math.max(...smoothed, 1);
  const toX = (i: number) => (i / (EPISODES - 1)) * chartW;
  const toY = (v: number) => chartH - 6 - ((v - minR) / (maxR - minR)) * (chartH - 12);
  const polyPoints = smoothed.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');

  const bg = isDark ? '#1a1a2e' : '#f5f5f5';
  const wallFill = isDark ? '#444' : '#777';
  const gridLine = isDark ? '#2a2a3e' : '#e0e0e0';
  const arrowColor = isDark ? '#90caf9' : '#1565c0';

  return (
    <Box sx={{ my: 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Button
          variant="contained"
          size="small"
          onClick={handleTrain}
          disabled={status === 'training' || playing}
        >
          {status === 'training' ? 'Training…' : status === 'ready' ? 'Retrain' : 'Train'}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handlePlay}
          disabled={status !== 'ready' || playing}
        >
          Play Episode
        </Button>
        {status === 'ready' && (
          <Typography variant="caption" color="text.secondary">
            {EPISODES} episodes · greedy policy
          </Typography>
        )}
      </Stack>

      <svg
        width={COLS * CELL}
        height={ROWS * CELL}
        style={{ display: 'block', borderRadius: 8, border: `1px solid ${isDark ? '#333' : '#ddd'}` }}
      >
        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: COLS }, (_, c) => {
            const wall = isWall(r, c);
            const goal = isGoal(r, c);
            const start = r === START[0] && c === START[1];
            const cellFill = wall ? wallFill : goal ? '#4caf50' : start ? '#1565c0' : bg;
            const policyA = q && !wall && !goal ? greedyA(q, r, c) : null;
            return (
              <g key={`${r},${c}`}>
                <rect
                  x={c * CELL} y={r * CELL}
                  width={CELL} height={CELL}
                  fill={cellFill}
                  stroke={gridLine}
                  strokeWidth={1}
                />
                {goal && (
                  <text x={c * CELL + CELL / 2} y={r * CELL + CELL / 2 + 7}
                    textAnchor="middle" fontSize={18} fontWeight="bold" fill="white">G</text>
                )}
                {start && (
                  <text x={c * CELL + CELL / 2} y={r * CELL + CELL / 2 + 7}
                    textAnchor="middle" fontSize={16} fill="white">S</text>
                )}
                {policyA !== null && !start && (
                  <text x={c * CELL + CELL / 2} y={r * CELL + CELL / 2 + 9}
                    textAnchor="middle" fontSize={24} fill={arrowColor} opacity={0.9}>
                    {ARROWS[policyA]}
                  </text>
                )}
              </g>
            );
          })
        )}
        <circle
          r={CELL * 0.26}
          fill="#ff9800"
          stroke="white"
          strokeWidth={2.5}
          style={{
            transform: `translate(${agentPos[1] * CELL + CELL / 2}px, ${agentPos[0] * CELL + CELL / 2}px)`,
            transition: 'transform 0.25s ease',
          }}
        />
      </svg>

      {curve.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Episode reward ({SMOOTH_WIN}-ep rolling avg)
          </Typography>
          <svg
            width={chartW}
            height={chartH}
            style={{
              display: 'block',
              borderRadius: 4,
              background: isDark ? '#111' : '#fafafa',
              border: `1px solid ${isDark ? '#333' : '#eee'}`,
            }}
          >
            <line
              x1={0} y1={toY(0)} x2={chartW} y2={toY(0)}
              stroke={isDark ? '#333' : '#ddd'}
              strokeDasharray="4,3"
            />
            <polyline
              points={polyPoints}
              fill="none"
              stroke="#ff9800"
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </svg>
        </Box>
      )}
    </Box>
  );
}
