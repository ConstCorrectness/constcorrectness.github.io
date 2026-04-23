export interface Note {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  category: 'AI' | 'Programming' | 'Math';
}

export const notes: Note[] = [
  {
    slug: 'anatomy-of-multi-head-attention',
    title: 'The Anatomy of Multi-Head Attention',
    date: '2024-03-15',
    tags: ['AI', 'Transformers', 'Interpretability'],
    category: 'AI',
    excerpt: 'An interactive deep dive into how Multi-Head Attention works under the hood, visualized with React and Three.js.'
  },
  {
    slug: 'rendering-math',
    title: '3D Projection Mathematics',
    date: '2024-02-10',
    tags: ['Math', 'Python', 'Graphics', 'WASM'],
    category: 'Math',
    excerpt: 'Exploring the linear algebra behind 3D to 2D projections using in-browser Python simulations.'
  },
  {
    slug: 'const-correctness',
    title: 'The Philosophy of Const Correctness',
    date: '2023-11-20',
    tags: ['C++', 'Programming', 'Philosophy'],
    category: 'Programming',
    excerpt: 'Why const correctness is about more than just compiler checks—it is about designing robust and intentional interfaces.'
  }
];
