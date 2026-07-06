import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Sidebar.css';

function Sidebar({ activePage, onNavigate }) {
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { key: 'energy',  label: t.nav.energy,  icon: '⚡' },
    { key: 'demand',  label: t.nav.demand,  icon: '📈' },
    { key: 'tariff',  label: t.nav.tariff,  icon: '💰' },
    { key: 'history', label: t.nav.history, icon: '📄' },
    { key: 'alert',   label: t.nav.alert,   icon: '🔔', badge: 3 },
  ];

  return (
    <aside className="sidebar">
      <div className="site-badge">
        <span className="site-dot" />
        <span>ECI 工廠</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">{t.section.monitor}</div>
        {NAV_ITEMS.slice(0, 3).map(item => (
          <NavItem key={item.key} item={item} active={activePage === item.key} onClick={onNavigate} />
        ))}
        <div className="nav-section-label" style={{ marginTop: 16 }}>{t.section.report}</div>
        <NavItem item={NAV_ITEMS[3]} active={activePage === 'history'} onClick={onNavigate} />
        <div className="nav-section-label" style={{ marginTop: 16 }}>{t.section.system}</div>
        <NavItem item={NAV_ITEMS[4]} active={activePage === 'alert'} onClick={onNavigate} />
      </nav>

      <div className="sidebar-footer">
        <div className="user-row">
          <div className="avatar">TL</div>
          <div>
            <div className="user-name">Terry Lin</div>
            <div className="user-role">{t.sidebar.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ item, active, onClick }) {
  return (
    <div className={`nav-item ${active ? 'active' : ''}`} onClick={() => onClick(item.key)}>
      <span className="nav-icon">{item.icon}</span>
      <span className="nav-label">{item.label}</span>
      {item.badge && <span className="nav-badge">{item.badge}</span>}
    </div>
  );
}

export default Sidebar;