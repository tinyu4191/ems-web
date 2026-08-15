import React, { useRef, useState, useEffect, useCallback } from 'react';
import { DASHBOARDS, MONITOR_DASHBOARDS, MONITOR_TABS } from '../config';
import { useLanguage } from '../context/LanguageContext';
import { downloadElectricityReportCSV, fetchElectricityZones } from '../utils/reportExport';
import './MainArea.css';

const PERIOD_OPTIONS = [
  { value: 'today', label: '今日' },
  { value: 'this_week', label: '本週' },
  { value: 'this_month', label: '本月' },
  { value: 'last_week', label: '上週' },
  { value: 'last_month', label: '上個月' },
];

function MainArea({ activePage }) {
  const iframeRef = useRef(null);
  const { t } = useLanguage();
  const [monitorTab, setMonitorTab] = useState('electricity');

  // ---- 報表頁面專用狀態 ----
  const [reportPeriod, setReportPeriod] = useState('this_month');
  const [zoneOptions, setZoneOptions] = useState([]);
  const [selectedZones, setSelectedZones] = useState('ALL'); // 'ALL' 或 string[]
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  // 離開 monitor 頁面再回來時，重置回預設分頁
  useEffect(() => {
    if (activePage === 'monitor') {
      setMonitorTab('electricity');
    }
  }, [activePage]);

  // 進入報表頁面時，抓一次區域清單（給選擇器用）
  useEffect(() => {
    if (activePage === 'history' && zoneOptions.length === 0) {
      fetchElectricityZones()
        .then(setZoneOptions)
        .catch((err) => {
          console.warn('無法取得區域清單', err);
        });
    }
  }, [activePage, zoneOptions.length]);

  const toggleZone = (zone) => {
    setSelectedZones((prev) => {
      if (prev === 'ALL') {
        // 從全選狀態點掉一個 => 變成除了這個以外全選
        return zoneOptions.filter((z) => z !== zone);
      }
      const next = prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone];
      // 如果點回全部，就收斂回 'ALL' 狀態
      return next.length === zoneOptions.length ? 'ALL' : next;
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadElectricityReportCSV(reportPeriod, selectedZones);
    } catch (err) {
      console.error(err);
      setDownloadError(err.message || '下載失敗，請稍後再試');
    } finally {
      setDownloading(false);
    }
  };

  // 建立報表 iframe 的網址（依目前選擇的期間/區域動態組成）
  const buildReportUrl = useCallback(() => {
    const base = DASHBOARDS.history.split('?')[0];
    const params = new URLSearchParams({
      orgId: '1',
      kiosk: 'true',
      from: 'now-6h',
      to: 'now',
      timezone: 'browser',
      '_dash.hideTimePicker': 'true',
      '_dash.hideVariables': 'true',
    });
    params.append('var-report_period', reportPeriod);
    if (selectedZones === 'ALL') {
      params.append('var-zone', '$__all');
    } else if (selectedZones.length === 0) {
      params.append('var-zone', '$__all'); // 全部取消勾選時，行為等同全選，避免查詢直接沒結果
    } else {
      selectedZones.forEach((z) => params.append('var-zone', z));
    }
    return `${base}?${params.toString()}`;
  }, [reportPeriod, selectedZones]);

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

  const renderReportToolbar = () => (
    <div className="report-toolbar">
      <div className="report-toolbar-group">
        <span className="report-toolbar-label">期間：</span>
        <select
          className="report-period-select"
          value={reportPeriod}
          onChange={(e) => setReportPeriod(e.target.value)}
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="report-toolbar-group">
        <span className="report-toolbar-label">區域：</span>
        <label className="report-zone-checkbox">
          <input
            type="checkbox"
            checked={selectedZones === 'ALL'}
            onChange={(e) => setSelectedZones(e.target.checked ? 'ALL' : [])}
          />
          全選
        </label>
        {zoneOptions.map((zone) => (
          <label key={zone} className="report-zone-checkbox">
            <input
              type="checkbox"
              checked={selectedZones === 'ALL' || selectedZones.includes(zone)}
              onChange={() => toggleZone(zone)}
            />
            {zone}
          </label>
        ))}
      </div>

      <button className="report-download-btn" onClick={handleDownload} disabled={downloading}>
        {downloading ? '下載中...' : '下載報表 (CSV)'}
      </button>

      {downloadError && <span className="report-download-error">{downloadError}</span>}
    </div>
  );

  const url = activePage === 'monitor'
    ? MONITOR_DASHBOARDS[monitorTab]
    : activePage === 'history'
      ? buildReportUrl()
      : DASHBOARDS[activePage];

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
      {activePage === 'history' && renderReportToolbar()}
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