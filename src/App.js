import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainArea from './components/MainArea';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('energy');

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <MainArea activePage={activePage} />
    </div>
  );
}

export default App;