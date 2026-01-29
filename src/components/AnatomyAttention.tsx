import React, { useEffect, useRef } from 'react';

const TAILWIND_CDN = 'https://cdn.tailwindcss.com';
const CHART_CDN = 'https://cdn.jsdelivr.net/npm/chart.js';
const MATHJAX_CDN = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
const FONT_CDN =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap';

type RadarMode = 'single' | 'multi';
type SentenceKey = 'tired' | 'wide';

const AnatomyAttention: React.FC = () => {
  const updateRadarRef = useRef<(mode: RadarMode) => void>(() => {});
  const setHeadRef = useRef<(index: number) => void>(() => {});
  const changeSentenceRef = useRef<(key: SentenceKey) => void>(() => {});
  const chartRef = useRef<any>(null);

  useEffect(() => {
    let disposed = false;
    const ensureScript = (src: string, id: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });

    const ensureStylesheet = (href: string, id: string) => {
      if (document.getElementById(id)) {
        return;
      }
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };

    const init = () => {
      // --- 1. Arithmetic Logic ---
      const dModelInput = document.getElementById('dModelInput') as HTMLInputElement | null;
      const headsInput = document.getElementById('headsInput') as HTMLInputElement | null;
      const dModelVal = document.getElementById('dModelVal');
      const headsVal = document.getElementById('headsVal');
      const dkDisplay = document.getElementById('dkDisplay');
      const mathDModel = document.getElementById('mathDModel');
      const mathHeads = document.getElementById('mathHeads');
      const mathDk = document.getElementById('mathDk');

      const parentVector = document.getElementById('parentVector') as HTMLDivElement | null;
      const headsContainer = document.getElementById('headsContainer') as HTMLDivElement | null;

      const renderVectorVisuals = (count: number) => {
        if (!parentVector || !headsContainer) return;
        parentVector.innerHTML = '';
        parentVector.style.background = 'linear-gradient(90deg, #1f2937 0%, #4b5563 100%)';

        headsContainer.innerHTML = '';
        headsContainer.style.gridTemplateColumns = `repeat(${Math.min(count, 8)}, minmax(0, 1fr))`;

        const colors = [
          '#2a9d8f',
          '#e9c46a',
          '#f4a261',
          '#e76f51',
          '#264653',
          '#2a9d8f',
          '#e9c46a',
          '#f4a261',
          '#e76f51',
          '#264653',
          '#2a9d8f',
          '#e9c46a',
          '#f4a261',
          '#e76f51',
          '#264653'
        ];

        for (let i = 0; i < count; i += 1) {
          const head = document.createElement('div');
          head.className =
            'h-16 rounded shadow-sm flex flex-col items-center justify-center text-white text-[10px] font-bold transition-all hover:scale-105';
          head.style.backgroundColor = colors[i % colors.length];
          head.innerText = `H${i + 1}`;

          const lines = document.createElement('div');
          lines.className = 'w-full px-1 flex flex-col gap-[2px] mt-1 opacity-50';
          for (let j = 0; j < 3; j += 1) {
            const line = document.createElement('div');
            line.className = 'h-[2px] bg-white rounded-full w-full';
            line.style.width = `${Math.random() * 50 + 50}%`;
            lines.appendChild(line);
          }
          head.appendChild(lines);
          headsContainer.appendChild(head);
        }
      };

      const updateMath = () => {
        if (!dModelInput || !headsInput) return;
        const d = parseInt(dModelInput.value, 10);
        const h = parseInt(headsInput.value, 10);
        const dk = Math.floor(d / h);

        if (dModelVal) dModelVal.innerText = `${d}`;
        if (headsVal) headsVal.innerText = `${h}`;
        if (dkDisplay) dkDisplay.innerText = `${dk}`;
        if (mathDModel) mathDModel.innerText = `${d}`;
        if (mathHeads) mathHeads.innerText = `${h}`;
        if (mathDk) mathDk.innerText = `${dk}`;

        renderVectorVisuals(h);
      };

      if (dModelInput && headsInput) {
        dModelInput.addEventListener('input', updateMath);
        headsInput.addEventListener('input', updateMath);
      }

      renderVectorVisuals(8);

      // --- 2. Chart.js Radar Logic ---
      const chartCanvas = document.getElementById('specializationChart') as HTMLCanvasElement | null;
      const Chart = (window as any).Chart as any;

      if (chartCanvas && Chart) {
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
        if (typeof Chart.getChart === 'function') {
          const existing = Chart.getChart(chartCanvas);
          if (existing) {
            existing.destroy();
          }
        }

        const ctx = chartCanvas.getContext('2d');
        if (ctx) {
          const radarData = {
            labels: ['Grammar', 'Coreference', 'Prepositions', 'Subject-Verb', 'Sentiment', 'Long-Range'],
            datasets: [
              {
                label: 'Single Head (Average)',
                data: [50, 50, 50, 50, 50, 50],
                fill: true,
                backgroundColor: 'rgba(107, 114, 128, 0.2)',
                borderColor: 'rgba(107, 114, 128, 1)',
                pointBackgroundColor: 'rgba(107, 114, 128, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(107, 114, 128, 1)'
              },
              {
                label: 'Multi-Head (Specialized)',
                data: [90, 85, 20, 95, 30, 80],
                fill: true,
                backgroundColor: 'rgba(42, 157, 143, 0.2)',
                borderColor: 'rgba(42, 157, 143, 1)',
                pointBackgroundColor: 'rgba(42, 157, 143, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(42, 157, 143, 1)'
              }
            ]
          };

          const config = {
            type: 'radar',
            data: radarData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              elements: {
                line: { borderWidth: 3 }
              },
              scales: {
                r: {
                  angleLines: { display: true },
                  suggestedMin: 0,
                  suggestedMax: 100,
                  ticks: { display: false }
                }
              },
              plugins: {
                legend: { display: false }
              }
            }
          };

          chartRef.current = new Chart(ctx, config);
        }
      }

      updateRadarRef.current = (mode: RadarMode) => {
        if (!chartRef.current) return;
        const buttons = document.querySelectorAll('#specialization button');
        buttons.forEach((b) => b.classList.remove('ring-2', 'ring-teal-500', 'bg-teal-50'));

        if (mode === 'single') {
          if (buttons[0]) buttons[0].classList.add('ring-2', 'ring-teal-500', 'bg-teal-50');
          chartRef.current.data.datasets[0].hidden = false;
          chartRef.current.data.datasets[1].hidden = true;
        } else {
          if (buttons[1]) buttons[1].classList.add('ring-2', 'ring-teal-500', 'bg-teal-50');
          chartRef.current.data.datasets[0].hidden = true;
          chartRef.current.data.datasets[1].hidden = false;
        }
        chartRef.current.update();
      };

      // --- 3. Interactive Lab Logic ---
      const sentences = {
        tired: {
          tokens: [
            'The',
            'animal',
            "didn't",
            'cross',
            'the',
            'street',
            'because',
            'it',
            'was',
            'too',
            'tired.'
          ],
          targetIndex: 7
        },
        wide: {
          tokens: [
            'The',
            'animal',
            "didn't",
            'cross',
            'the',
            'street',
            'because',
            'it',
            'was',
            'too',
            'wide.'
          ],
          targetIndex: 7
        }
      } as const;

      const attentionMaps = {
        tired: {
          0: [0.05, 0.1, 0.1, 0.1, 0.05, 0.1, 0.1, 0.0, 0.2, 0.1, 0.1],
          1: [0.0, 0.8, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2],
          2: [0.0, 0.1, 0.0, 0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.8],
          3: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.0, 0.1, 0.1, 0.1]
        },
        wide: {
          0: [0.05, 0.1, 0.1, 0.1, 0.05, 0.1, 0.1, 0.0, 0.2, 0.1, 0.1],
          1: [0.0, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.8],
          2: [0.0, 0.1, 0.0, 0.0, 0.0, 0.8, 0.0, 0.0, 0.0, 0.0, 0.1],
          3: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.0, 0.1, 0.1, 0.1]
        }
      } as const;

      const headExplanations = {
        tired: [
          "Focuses on immediate grammatical neighbors ('was', 'because'). It establishes local sentence structure.",
          "High attention on 'animal'. This head has learned that entities which get 'tired' are usually animate subjects.",
          'Low relevance here. This head specializes in physical properties of objects.',
          "Broad, unfocused attention. Often used as a 'fallback' or for punctuation."
        ],
        wide: [
          "Focuses on immediate grammatical neighbors ('was', 'because'). Structure remains constant.",
          "Low confidence. The property 'wide' doesn't strongly correlate with 'animal' for this head.",
          "High attention on 'street'. This head connects physical descriptors ('wide') to physical objects ('street').",
          'Broad, unfocused attention.'
        ]
      } as const;

      let currentSentenceKey: SentenceKey = 'tired';
      let currentHeadIndex = 1;

      const container = document.getElementById('sentenceContainer');
      const histoContainer = document.getElementById('histogramContainer');
      const explainTitle = document.getElementById('explanationTitle');
      const explainText = document.getElementById('explanationText');

      const renderSentence = () => {
        if (!container || !histoContainer) return;
        container.innerHTML = '';
        histoContainer.innerHTML = '';

        const data = sentences[currentSentenceKey];
        const weights = attentionMaps[currentSentenceKey][currentHeadIndex as keyof typeof attentionMaps.tired];

        data.tokens.forEach((token, index) => {
          const span = document.createElement('span');
          span.innerText = token;
          span.className = 'px-1 rounded cursor-default transition-colors duration-300';

          if (index === data.targetIndex) {
            span.classList.add('border-b-2', 'border-teal-500', 'font-bold');
          }

          if (index !== data.targetIndex) {
            const weight = weights[index];
            if (weight > 0.05) {
              span.style.backgroundColor = `rgba(233, 196, 106, ${weight * 1.2})`;
            }
          }

          container.appendChild(span);

          const barWrapper = document.createElement('div');
          barWrapper.className = 'flex flex-col items-center flex-1 h-full justify-end group relative';

          const bar = document.createElement('div');
          bar.className = 'w-full bg-teal-500 rounded-t transition-all duration-300';
          bar.style.height = `${weights[index] * 100}%`;

          const tip = document.createElement('div');
          tip.className =
            'absolute -top-8 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition';
          tip.innerText = `${(weights[index] * 100).toFixed(0)}%`;

          barWrapper.appendChild(tip);
          barWrapper.appendChild(bar);

          const label = document.createElement('div');
          label.innerText = token;
          label.className = 'text-[8px] mt-1 truncate w-full text-center text-gray-400 hidden sm:block';
          barWrapper.appendChild(label);

          histoContainer.appendChild(barWrapper);
        });
      };

      const updateExplanation = () => {
        if (!explainTitle || !explainText) return;
        const colors = ['text-teal-300', 'text-yellow-300', 'text-purple-300', 'text-pink-300'];
        const titles = ['Syntax/Grammar', 'Coreference (Animate)', 'Coreference (Object)', 'Punctuation/Diffuse'];

        explainTitle.innerText = titles[currentHeadIndex];
        explainTitle.className = `font-bold mb-2 ${colors[currentHeadIndex]}`;
        explainText.innerText = headExplanations[currentSentenceKey][currentHeadIndex];
      };

      setHeadRef.current = (index: number) => {
        currentHeadIndex = index;
        document.querySelectorAll('.head-btn').forEach((btn) => {
          btn.classList.remove('bg-gray-600', 'ring-2', 'ring-teal-500');
          btn.classList.add('bg-gray-700');
          const head = parseInt((btn as HTMLElement).dataset.head || '-1', 10);
          if (head === index) {
            btn.classList.remove('bg-gray-700');
            btn.classList.add('bg-gray-600', 'ring-2', 'ring-teal-500');
          }
        });

        renderSentence();
        updateExplanation();
      };

      changeSentenceRef.current = (type: SentenceKey) => {
        currentSentenceKey = type;
        const btnTired = document.getElementById('btn-tired');
        const btnWide = document.getElementById('btn-wide');

        if (btnTired && btnWide) {
          if (type === 'tired') {
            btnTired.className =
              'px-3 py-1 text-xs font-bold rounded bg-gray-200 hover:bg-gray-300 transition text-gray-900';
            btnWide.className =
              'px-3 py-1 text-xs font-bold rounded bg-white border border-gray-200 hover:bg-gray-100 transition text-gray-500';
          } else {
            btnWide.className =
              'px-3 py-1 text-xs font-bold rounded bg-gray-200 hover:bg-gray-300 transition text-gray-900';
            btnTired.className =
              'px-3 py-1 text-xs font-bold rounded bg-white border border-gray-200 hover:bg-gray-100 transition text-gray-500';
          }
        }

        renderSentence();
        updateExplanation();
      };

      updateRadarRef.current('multi');
      updateMath();
      setHeadRef.current(1);

      const mathJax = (window as any).MathJax;
      if (mathJax && typeof mathJax.typesetPromise === 'function') {
        mathJax.typesetPromise();
      }
    };

    const boot = async () => {
      ensureStylesheet(FONT_CDN, 'attention-fonts');
      if (!(window as any).MathJax) {
        (window as any).MathJax = {
          tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] }
        };
      }
      await ensureScript(TAILWIND_CDN, 'attention-tailwind');
      await ensureScript(CHART_CDN, 'attention-chart');
      await ensureScript(MATHJAX_CDN, 'attention-mathjax');
      if (!disposed) {
        init();
      }
    };

    void boot();
    return () => {
      disposed = true;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  const handleUpdateRadar = (mode: RadarMode) => updateRadarRef.current(mode);
  const handleSetHead = (index: number) => setHeadRef.current(index);
  const handleChangeSentence = (type: SentenceKey) => changeSentenceRef.current(type);

  return (
    <div className="attention-post">
      <style>
        {`
        /* Chosen Palette: Warm Neutrals & Academic Clarity */
        :root {
            --bg-canvas: #0f1115;
            --text-main: #e6eef7;
            --text-muted: #9aa6b2;
            --accent-1: #61dafb;
            --accent-2: #e9c46a;
            --accent-3: #f4a261;
            --accent-4: #e76f51;
            --accent-5: #264653;
            --card-bg: #151a21;
        }

        .attention-post {
            background-color: var(--bg-canvas);
            color: var(--text-main);
            font-family: 'Inter', sans-serif;
        }

        .attention-post .mono-font {
            font-family: 'JetBrains Mono', monospace;
        }

        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 4px;
        }

        .interactive-card {
            transition: all 0.3s ease;
        }
        .interactive-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .word-token {
            transition: background-color 0.2s;
            cursor: pointer;
        }

        .chart-wrapper {
            position: relative;
            width: 100%;
            height: 300px;
            max-height: 400px;
        }

        .attention-post .bg-white { background-color: #151a21 !important; }
        .attention-post .bg-gray-50 { background-color: #11161c !important; }
        .attention-post .bg-gray-100 { background-color: #121821 !important; }
        .attention-post .bg-gray-200 { background-color: #1a2230 !important; }
        .attention-post .bg-gray-900 { background-color: #0b0f14 !important; }
        .attention-post .text-gray-900 { color: #e6eef7 !important; }
        .attention-post .text-gray-800 { color: #d7e1ee !important; }
        .attention-post .text-gray-700 { color: #d2dbe8 !important; }
        .attention-post .text-gray-600 { color: #c2ccda !important; }
        .attention-post .text-gray-500 { color: #b0bccb !important; }
        .attention-post .text-gray-400 { color: #9aa7b8 !important; }
        .attention-post .text-gray-300 { color: #e0e8f2 !important; }
        .attention-post .border-gray-100 { border-color: #1f2833 !important; }
        .attention-post .border-gray-200 { border-color: #263141 !important; }
        .attention-post .border-gray-700 { border-color: #38465b !important; }
        .attention-post .text-teal-600 { color: #61dafb !important; }
        .attention-post .text-teal-700 { color: #61dafb !important; }
        .attention-post .text-teal-300 { color: #7fe3ff !important; }
        .attention-post .bg-teal-50 { background-color: #0d2a33 !important; }
        .attention-post .bg-teal-100 { background-color: #0f3440 !important; }
        .attention-post .bg-teal-500 { background-color: #61dafb !important; }
        .attention-post .bg-teal-900 { background-color: #0b2a33 !important; }
        .attention-post .ring-teal-500 { --tw-ring-color: #61dafb !important; }
        .attention-post .hover\\:bg-teal-50:hover { background-color: #0d2a33 !important; }
        .attention-post .hover\\:text-teal-600:hover { color: #61dafb !important; }
      `}
      </style>

      <div className="h-6" />

      <section id="intro" className="py-20 px-4 sm:px-6 lg:px-8 w-full text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
          Why does <span className="text-teal-600">Splitting</span> Dimensions Create{' '}
          <br className="hidden sm:block" />
          Better Understanding?
        </h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          In Transformer models like BERT or GPT, we often take a massive vector (e.g., 256 dimensions)
          and slice it into smaller chunks (e.g., 8 heads × 32 dimensions).
          <br />
          <br />
          It seems counterintuitive: <strong>How can &quot;dumbing down&quot; the resolution from 256 to
          32 help the model see more?</strong>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                1
              </div>
              <h3 className="font-bold text-gray-800">The &quot;Blurry Generalist&quot; Problem</h3>
            </div>
            <p className="text-gray-600 text-sm">
              A single large head tries to capture grammar, tone, references, and logic all in one dot
              product. The signals get muddled.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-600">
                8
              </div>
              <h3 className="font-bold text-gray-800">The &quot;Team of Specialists&quot; Solution</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Splitting dimensions allows each &quot;Head&quot; to project the input into a unique{' '}
              <strong>subspace</strong>. One looks for pronouns, another for prepositions.
            </p>
          </div>
        </div>
      </section>

      <section id="arithmetic" className="bg-gray-50 py-16 border-y border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">1. The Arithmetic of the Split</h2>
            <p className="text-gray-600">
              Let&apos;s look at the numbers. The total parameter count remains roughly the same because
              we divide the dimension size ({'$d_{model}$'}) by the number of heads ($h$). Adjust the
              sliders to see how the per-head dimension ({'$d_k$'}) changes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
              <h3 className="font-semibold text-gray-900 mb-6 border-b pb-2">Configuration</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Embedding Dimension ({'$d_{model}$'})
                </label>
                <input
                  type="range"
                  id="dModelInput"
                  min="64"
                  max="1024"
                  step="64"
                  defaultValue="256"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>64</span>
                  <span id="dModelVal" className="font-bold text-teal-700">
                    256
                  </span>
                  <span>1024</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Heads ($h$)
                </label>
                <input
                  type="range"
                  id="headsInput"
                  min="1"
                  max="16"
                  step="1"
                  defaultValue="8"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span id="headsVal" className="font-bold text-teal-700">
                    8
                  </span>
                  <span>16</span>
                </div>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                <p className="text-sm text-teal-800 font-medium text-center">
                  Dimension per Head ($d_k$): <br />
                  <span className="text-3xl font-bold mono-font" id="dkDisplay">
                    32
                  </span>
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center items-center relative overflow-hidden">
              <h3 className="absolute top-6 left-6 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Vector Visualization
              </h3>

              <div className="w-full mt-8">
                <div className="flex flex-col items-center mb-8">
                  <div className="text-xs text-gray-500 mb-1">Original Vector ({'$d_{model}$'})</div>
                  <div
                    id="parentVector"
                    className="h-12 w-full bg-gray-800 rounded-md shadow-lg flex overflow-hidden transition-all duration-500"
                  />
                </div>

                <div className="flex justify-center mb-8 text-gray-300">
                  <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>

                <div className="text-xs text-gray-500 mb-1 text-center">Projected Heads ($h × d_k$)</div>
                <div id="headsContainer" className="grid grid-cols-4 gap-2 transition-all duration-500" />
              </div>

              <div className="mt-8 bg-yellow-50 p-4 rounded text-sm text-yellow-800 border border-yellow-200">
                <strong>The Mathematical Insight:</strong>
                <br />
                We aren&apos;t losing data. We are reshaping it. Instead of one long vector of size{' '}
                <span id="mathDModel">256</span>, we now have <span id="mathHeads">8</span> independent
                vectors of size <span id="mathDk">32</span>. Each head can now learn a different linear
                projection matrix ($W^Q_i, W^K_i, W^V_i$).
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="specialization" className="py-16 w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">2. The &quot;Context Subspace&quot; Theory</h2>
            <p className="text-lg text-gray-600 mb-6">
              Why does this help? Imagine a single attention head is a &quot;General Manager&quot;. They
              try to oversee everything—grammar, facts, tone—but miss the details.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Multi-head attention creates a &quot;Team of Specialists&quot;. By projecting the 256
              dimensions down to 32, each head is forced to focus on a specific{' '}
              <strong>subspace</strong> of the language features.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => handleUpdateRadar('single')}
                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition group flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-gray-800 block">Single Head (256 dims)</span>
                  <span className="text-sm text-gray-500">Tries to do it all, results in averaged, blurry attention.</span>
                </div>
                <div className="w-4 h-4 rounded-full border border-gray-300 group-hover:bg-teal-500" />
              </button>
              <button
                onClick={() => handleUpdateRadar('multi')}
                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition group flex items-center justify-between ring-2 ring-teal-500 bg-teal-50"
              >
                <div>
                  <span className="font-bold text-gray-800 block">Multi-Head (8 x 32 dims)</span>
                  <span className="text-sm text-gray-500">Each head specializes in one linguistic feature.</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-teal-500 border border-teal-500" />
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
            <div className="text-center mb-2 font-bold text-gray-700">Head Competency Map</div>
            <div className="chart-wrapper mx-auto">
              <canvas id="specializationChart" />
            </div>
            <p className="text-xs text-center text-gray-300 mt-2">
              *Radial axis represents attention strength/clarity on a specific feature.
            </p>
          </div>
        </div>
      </section>

      <section id="lab" className="bg-gray-900 text-white py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="bg-teal-900 text-teal-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Interactive Experiment
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">Resolving Ambiguity</h2>
            <p className="text-gray-400">
              The classic &quot;Winograd Schema&quot; challenge. Consider the sentence below. The word{' '}
              <strong>&quot;it&quot;</strong> is ambiguous. Depending on the context (&quot;tired&quot; vs
              &quot;wide&quot;), &quot;it&quot; refers to a different noun.
              <br />
              Click the <span className="text-teal-400">Heads</span> below to see how they attend differently.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Select Attention Head
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSetHead(0)}
                  className="head-btn p-3 rounded bg-gray-700 hover:bg-gray-600 border border-transparent focus:ring-2 focus:ring-teal-500 transition text-left active-head"
                  data-head="0"
                >
                  <div className="text-xs text-gray-400">Head 1</div>
                  <div className="font-bold text-teal-300">Syntax/Grammar</div>
                </button>
                <button
                  onClick={() => handleSetHead(1)}
                  className="head-btn p-3 rounded bg-gray-700 hover:bg-gray-600 border border-transparent focus:ring-2 focus:ring-teal-500 transition text-left"
                  data-head="1"
                >
                  <div className="text-xs text-gray-400">Head 2</div>
                  <div className="font-bold text-yellow-300">Coreference (Tired)</div>
                </button>
                <button
                  onClick={() => handleSetHead(2)}
                  className="head-btn p-3 rounded bg-gray-700 hover:bg-gray-600 border border-transparent focus:ring-2 focus:ring-teal-500 transition text-left"
                  data-head="2"
                >
                  <div className="text-xs text-gray-400">Head 3</div>
                  <div className="font-bold text-purple-300">Coreference (Wide)</div>
                </button>
                <button
                  onClick={() => handleSetHead(3)}
                  className="head-btn p-3 rounded bg-gray-700 hover:bg-gray-600 border border-transparent focus:ring-2 focus:ring-teal-500 transition text-left"
                  data-head="3"
                >
                  <div className="text-xs text-gray-400">Head 4</div>
                  <div className="font-bold text-pink-300">Punctuation</div>
                </button>
              </div>

              <div className="mt-8 p-4 bg-gray-900/50 rounded border border-gray-700">
                <h4 className="font-bold text-white mb-2" id="explanationTitle">
                  Syntax/Grammar Head
                </h4>
                <p className="text-sm text-gray-400" id="explanationText">
                  This head focuses on the immediate syntactic structure. It likely links &quot;it&quot; to the
                  nearest preceding noun or verb, purely based on sentence position, without deep semantic
                  understanding.
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 bg-white rounded-xl p-8 text-gray-900 shadow-2xl relative">
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => handleChangeSentence('tired')}
                  className="px-3 py-1 text-xs font-bold rounded bg-gray-200 hover:bg-gray-300 transition"
                  id="btn-tired"
                >
                  Version A: Tired
                </button>
                <button
                  onClick={() => handleChangeSentence('wide')}
                  className="px-3 py-1 text-xs font-bold rounded bg-white border border-gray-200 hover:bg-gray-100 transition text-gray-500"
                  id="btn-wide"
                >
                  Version B: Wide
                </button>
              </div>

              <div className="mt-12 mb-8">
                <div className="flex flex-wrap gap-2 text-xl md:text-2xl font-serif leading-relaxed" id="sentenceContainer" />
              </div>

              <div className="h-1 w-full bg-gray-100 rounded overflow-hidden">
                <div id="attentionBar" className="h-full bg-teal-500 transition-all duration-300" style={{ width: '0%' }} />
              </div>

              <div className="mt-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Attention Weights (From word &quot;it&quot;)</h4>
                <div className="flex gap-1 h-16 items-end" id="histogramContainer" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-t border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">The Mathematical Mechanism</h2>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 font-mono text-sm md:text-base overflow-x-auto">
            <p className="mb-4 text-gray-500">// The Scaled Dot-Product Attention</p>
            <div className="flex justify-center items-center gap-4">
              <span>Attention(Q, K, V) = softmax</span>
              <div className="flex flex-col items-center px-2 border-l border-r border-gray-400">
                <span className="border-b border-gray-400 w-full mb-1 pb-1">
                  Q K<sup>T</sup>
                </span>
                <span>√d<sub>k</sub></span>
              </div>
              <span>V</span>
            </div>
          </div>
          <p className="mt-6 text-gray-600 leading-relaxed text-left">
            <strong>Why divide by {'$\\sqrt{d_k}$'}?</strong> When dimensions ({'$d_k$'}) are large (e.g., 256),
            the dot products can grow huge. This pushes the Softmax function into regions where gradients are
            extremely small (vanishing gradients). By splitting 256 into 8 heads of 32, we keep {'$d_k$'} small
            (32). The dot products stay in a manageable range, making training more stable and allowing the model
            to distinguish
            subtle differences in meaning.
          </p>
        </div>
      </section>

    </div>
  );
};

export default AnatomyAttention;
