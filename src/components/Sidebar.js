import React from 'react';
import './Sidebar.css';

const NAV_ITEMS = [
  { key: 'energy',  label: '能源總覽', icon: '⚡' },
  { key: 'demand',  label: '需量分析', icon: '📈' },
  { key: 'tariff',  label: '分時電價', icon: '💰' },
  { key: 'history', label: '歷史報告', icon: '📄' },
  { key: 'alert',   label: '告警設定', icon: '🔔', badge: 3 },
];

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">⚡</div>
        <div>
          <div className="logo-title">Tectiiko EMS</div>
          <div className="logo-sub">Energy Management</div>
        </div>
      </div>

      <div className="site-badge">
        <span className="site-dot" />
        <span>ECI 工廠</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">監控</div>
        {NAV_ITEMS.slice(0, 3).map(item => (
          <NavItem key={item.key} item={item} active={activePage === item.key} onClick={onNavigate} />
        ))}
        <div className="nav-section-label" style={{ marginTop: 16 }}>報告</div>
        <NavItem item={NAV_ITEMS[3]} active={activePage === 'history'} onClick={onNavigate} />
        <div className="nav-section-label" style={{ marginTop: 16 }}>系統</div>
        <NavItem item={NAV_ITEMS[4]} active={activePage === 'alert'} onClick={onNavigate} />
      </nav>

      <div className="sidebar-footer">
        <div className="user-row">
          <div className="avatar">TL</div>
          <div>
            <div className="user-name">Terry Lin</div>
            <div className="user-role">系統管理員</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ item, active, onClick }) {
  return (
    <div
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={() => onClick(item.key)}
    >
      <span className="nav-icon">{item.icon}</span>
      <span className="nav-label">{item.label}</span>
      {item.badge && <span className="nav-badge">{item.badge}</span>}
    </div>
  );
}

export default Sidebar;