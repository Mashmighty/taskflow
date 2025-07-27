import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Login from './pages/Login';

// Components
import Navbar from './components/Navbar';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="w-screen min-h-screen bg-gray-50">
          <Navbar />
          <main className="w-full">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;