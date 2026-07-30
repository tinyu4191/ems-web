import React, { useRef, useState, useEffect } from 'react';
import { DASHBOARDS, MONITOR_DASHBOARDS, MONITOR_TABS } from '../config';
import { useLanguage } from '../context/LanguageContext';
import './MainArea.css';

function MainArea({ activePage }) {
  const iframeRef = useRef(null);
  const { t } = useLanguage();
  const [monitorTab, setMonitorTab] = useState('electricity');

  // 離開 monitor 頁面再回來時，重置回預設分頁
  useEffect(() => {
    if (activePage === 'monitor') {
      setMonitorTab('electricity');
    }
  }, [activePage]);

  const url = activePage === 'monitor'
    ? MONITOR_DASHBOARDS[monitorTab]
    : DASHBOARDS[activePage];

  const handleIframeLoad = () => {
    try {
      const iframeWindow = iframeRef.current.contentWindow;
      const iframeDoc = iframeWindow.document;

      const blockEsc = (e) => {
        if (e.key === 'Escape') {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      };

      iframeWindow.addEventListener('keydown', blockEsc, { capture: true });
      iframeDoc.addEventListener('keydown', blockEsc, { capture: true });
    } catch (err) {
      console.warn('無法存取 iframe document，確認是否為同源', err);
    }
  };

  const renderMonitorTabs = () => (
    <div className="monitor-tabs">
      {MONITOR_TABS.map((tab) => (
        <button
          key={tab}
          className={`monitor-tab-btn ${monitorTab === tab ? 'active' : ''}`}
          onClick={() => setMonitorTab(tab)}
        >
          {t.monitorTabs[tab]}
        </button>
      ))}
    </div>
  );

  if (!url) {
    return (
      <div className="main-area">
        {activePage === 'monitor' && renderMonitorTabs()}
        <div className="coming-soon">
          <div className="coming-soon-icon">🚧</div>
          <div className="coming-soon-title">{t.comingSoon.title}</div>
          <div className="coming-soon-sub">{t.comingSoon.sub}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-area">
      {activePage === 'monitor' && renderMonitorTabs()}
      <iframe
        ref={iframeRef}
        src={url}
        title={activePage === 'monitor' ? `${activePage}-${monitorTab}` : activePage}
        className="grafana-frame"
        frameBorder="0"
        onLoad={handleIframeLoad}
      />
    </div>
  );
}

export default MainArea;