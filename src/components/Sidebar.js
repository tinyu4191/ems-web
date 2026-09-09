import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Sidebar.css';

// ---- 線條風格 icon（inline SVG，不依賴外部套件）----
const IconEnergy = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconDemand = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 17 9 11 13 15 21 7" />
    <polyline points="14 7 21 7 21 14" />
  </svg>
);
const IconTariff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15.5 14" />
  </svg>
);
const IconMonitor = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);
const IconHistory = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);
const IconAlert = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

function Sidebar({ activePage, onNavigate }) {
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { key: 'energy',  label: t.nav.energy,  Icon: IconEnergy },
    { key: 'demand',  label: t.nav.demand,  Icon: IconDemand },
    { key: 'tariff',  label: t.nav.tariff,  Icon: IconTariff },
    { key: 'monitor', label: t.nav.monitor, Icon: IconMonitor },
    { key: 'history', label: t.nav.history, Icon: IconHistory },
    { key: 'alert',   label: t.nav.alert,   Icon: IconAlert },
  ];

  return (
    <aside className="sidebar">
      <div className="site-badge">
        <span className="site-dot" />
        <span>ECI 工廠</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">{t.section.monitor}</div>
        {NAV_ITEMS.slice(0, 4).map(item => (
          <NavItem key={item.key} item={item} active={activePage === item.key} onClick={onNavigate} />
        ))}
        <div className="nav-section-label" style={{ marginTop: 16 }}>{t.section.report}</div>
        <NavItem item={NAV_ITEMS[4]} active={activePage === 'history'} onClick={onNavigate} />
        <div className="nav-section-label" style={{ marginTop: 16 }}>{t.section.system}</div>
        <NavItem item={NAV_ITEMS[5]} active={activePage === 'alert'} onClick={onNavigate} />
      </nav>

      <div className="sidebar-footer">
        <div className="user-row">
          <div className="avatar">ECI</div>
          <div>
            <div className="user-name">ECI 工廠</div>
            <div className="user-role">{t.sidebar.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ item, active, onClick }) {
  const { Icon } = item;
  return (
    <div className={`nav-item ${active ? 'active' : ''}`} onClick={() => onClick(item.key)}>
      <span className="nav-icon"><Icon /></span>
      <span className="nav-label">{item.label}</span>
      {item.badge && <span className="nav-badge">{item.badge}</span>}
    </div>
  );
}

export default Sidebar;