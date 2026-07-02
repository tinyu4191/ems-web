import React from 'react';
import { DASHBOARDS } from '../config';
import './MainArea.css';

function MainArea({ activePage }) {
  const url = DASHBOARDS[activePage];

  if (!url) {
    return (
      <div className="main-area">
        <div className="coming-soon">
          <div className="coming-soon-icon">🚧</div>
          <div className="coming-soon-title">功能開發中</div>
          <div className="coming-soon-sub">此模塊將於後續版本推出</div>
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