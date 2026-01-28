import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import NotesList from './pages/NotesList';
import NoteView from './pages/NoteView';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/notes" element={<NotesList />} />
        <Route path="/notes/:slug" element={<NoteView />} />
      </Routes>
    </Layout>
  );
}

export default App;