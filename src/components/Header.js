import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteProfile } from '../context/SiteProfileContext';
import SiteSettingsModal from './SiteSettingsModal';
import './Header.css';

function Header() {
  const { lang, toggleLang } = useLanguage();
  const { profile } = useSiteProfile();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="header-brand">
          {profile.logoDataUrl ? (
            <img src={profile.logoDataUrl} alt="logo" className="header-logo-img" />
          ) : (
            <div className="header-logo-icon">⚡</div>
          )}
          <span className="header-company-name">{profile.companyName}</span>
        </div>

        <div className="header-actions">
          <button className="lang-switch" onClick={toggleLang} title="Language / 語言">
            <span className={lang === 'zh' ? 'lang-active' : ''}>中文</span>
            <span className="lang-divider">/</span>
            <span className={lang === 'en' ? 'lang-active' : ''}>EN</span>
          </button>
          <button className="header-icon-btn" onClick={() => setShowSettings(true)} title="Settings">
            ⚙️
          </button>
        </div>
      </header>

      {showSettings && <SiteSettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}

export default Header;