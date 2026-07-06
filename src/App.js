import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainArea from './components/MainArea';
import Footer from './components/Footer';
import { LanguageProvider } from './context/LanguageContext';
import { SiteProfileProvider } from './context/SiteProfileContext';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('energy');

  return (
    <LanguageProvider>
      <SiteProfileProvider>
        <div className="app-shell">
          <Header />
          <div className="app-body">
            <Sidebar activePage={activePage} onNavigate={setActivePage} />
            <MainArea activePage={activePage} />
          </div>
          <Footer />
        </div>
      </SiteProfileProvider>
    </LanguageProvider>
  );
}

export default App;