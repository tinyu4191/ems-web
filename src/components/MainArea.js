import React from 'react';
import { DASHBOARDS } from '../config';
import { useLanguage } from '../context/LanguageContext';
import './MainArea.css';

function MainArea({ activePage }) {
  const { t } = useLanguage();
  const url = DASHBOARDS[activePage];

  if (!url) {
    return (
      <div className="main-area">
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
      <iframe
        src={url}
        title={activePage}
        className="grafana-frame"
        frameBorder="0"
      />
    </div>
  );
}

export default MainArea;