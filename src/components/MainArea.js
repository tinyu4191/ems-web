import React, { useRef, useState, useEffect, useCallback } from 'react';
import { DASHBOARDS, MONITOR_DASHBOARDS, MONITOR_TABS } from '../config';
import { useLanguage } from '../context/LanguageContext';
import {
  computePeriodRange,
  fetchCategories,
  fetchReportPreview,
  downloadReportExcel,
} from '../utils/energyReport';
import './MainArea.css';

const PERIOD_VALUES = ['today', 'this_week', 'last_week', 'this_month', 'last_month'];
const ENERGY_TYPE_VALUES = ['electricity', 'water'];

function MainArea({ activePage }) {
  const iframeRef = useRef(null);
  const { t } = useLanguage();
  const [monitorTab, setMonitorTab] = useState('electricity');

  // ---- 能源報表頁面專用狀態 ----
  const [energyType, setEnergyType] = useState('electricity');
  const [period, setPeriod] = useState('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState('ALL'); // 'ALL' 或 string[]
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const zoneDropdownRef = useRef(null);

  // 離開 monitor 頁面再回來時，重置回預設分頁
  useEffect(() => {
    if (activePage === 'monitor') {
      setMonitorTab('electricity');
    }
  }, [activePage]);

  // 點擊區域下拉選單以外的地方，自動關閉
  useEffect(() => {
    if (!zoneDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (zoneDropdownRef.current && !zoneDropdownRef.current.contains(e.target)) {
        setZoneDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [zoneDropdownOpen]);

  const getActiveRange = useCallback(() => {
    if (period === 'custom') {
      if (!customFrom || !customTo) return null;
      return { from: customFrom, to: customTo };
    }
    return computePeriodRange(period);
  }, [period, customFrom, customTo]);

  useEffect(() => {
    if (activePage !== 'history') return;
    fetchCategories(energyType)
      .then((cats) => {
        setCategoryOptions(cats);
        setSelectedCategories('ALL');
      })
      .catch((err) => {
        console.warn('無法取得分類清單', err);
        setCategoryOptions([]);
      });
  }, [activePage, energyType]);

  useEffect(() => {
    if (activePage !== 'history') return;
    const range = getActiveRange();
    if (!range) return;

    setLoadingPreview(true);
    setReportError(null);
    fetchReportPreview({
      energyType,
      from: range.from,
      to: range.to,
      categories: selectedCategories,
    })
      .then(setPreviewData)
      .catch((err) => {
        console.error(err);
        setReportError(err.message || '查詢失敗，請稍後再試');
        setPreviewData(null);
      })
      .finally(() => setLoadingPreview(false));
  }, [activePage, energyType, selectedCategories, getActiveRange]);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) => {
      if (prev === 'ALL') {
        return categoryOptions.filter((c) => c !== cat);
      }
      const next = prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat];
      return next.length === categoryOptions.length ? 'ALL' : next;
    });
  };

  const handleDownload = async () => {
    const range = getActiveRange();
    if (!range) {
      setReportError(t.report.selectPeriodPrompt);
      return;
    }
    setDownloading(true);
    setReportError(null);
    try {
      await downloadReportExcel({
        energyType,
        from: range.from,
        to: range.to,
        categories: selectedCategories,
      });
    } catch (err) {
      console.error(err);
      setReportError(err.message || '下載失敗，請稍後再試');
    } finally {
      setDownloading(false);
    }
  };

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

  const zoneButtonLabel = () => {
    if (selectedCategories === 'ALL') return t.report.all;
    if (selectedCategories.length === 0) return t.report.selectZone;
    return t.report.selectedCount(selectedCategories.length);
  };

  const renderReportToolbar = () => (
    <div className="report-toolbar">
      <div className="report-toolbar-group">
        <span className="report-toolbar-label">{t.report.energyLabel}</span>
        {ENERGY_TYPE_VALUES.map((val) => (
          <button
            key={val}
            className={`report-energy-btn ${energyType === val ? 'active' : ''}`}
            onClick={() => setEnergyType(val)}
          >
            {t.report.energyOptions[val]}
          </button>
        ))}
      </div>

      <div className="report-toolbar-group">
        <span className="report-toolbar-label">{t.report.periodLabel}</span>
        {PERIOD_VALUES.map((val) => (
          <button
            key={val}
            className={`report-period-btn ${period === val ? 'active' : ''}`}
            onClick={() => setPeriod(val)}
          >
            {t.report.periods[val]}
          </button>
        ))}
        <button
          className={`report-period-btn ${period === 'custom' ? 'active' : ''}`}
          onClick={() => setPeriod('custom')}
        >
          {t.report.periods.custom}
        </button>
        {period === 'custom' && (
          <>
            <input
              type="date"
              className="report-date-input"
              value={customFrom}
              max={customTo || undefined}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
            <span className="report-toolbar-label">{t.report.to}</span>
            <input
              type="date"
              className="report-date-input"
              value={customTo}
              min={customFrom || undefined}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </>
        )}
      </div>

      <div className="report-toolbar-group report-zone-dropdown-wrap" ref={zoneDropdownRef}>
        <span className="report-toolbar-label">{t.report.zoneLabel}</span>
        <button
          className="report-zone-dropdown-btn"
          onClick={() => setZoneDropdownOpen((prev) => !prev)}
        >
          {zoneButtonLabel()} ▾
        </button>
        {zoneDropdownOpen && (
          <div className="report-zone-dropdown-panel">
            <label className="report-zone-checkbox">
              <input
                type="checkbox"
                checked={selectedCategories === 'ALL'}
                onChange={(e) => setSelectedCategories(e.target.checked ? 'ALL' : [])}
              />
              {t.report.all}
            </label>
            <div className="report-zone-dropdown-divider" />
            {categoryOptions.map((cat) => (
              <label key={cat} className="report-zone-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCategories === 'ALL' || selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                {cat}
              </label>
            ))}
          </div>
        )}
      </div>

      <button className="report-download-btn" onClick={handleDownload} disabled={downloading}>
        {downloading ? t.report.downloading : t.report.download}
      </button>

      {reportError && <span className="report-download-error">{reportError}</span>}
    </div>
  );

  const renderReportTable = () => {
    if (loadingPreview) {
      return <div className="report-status">{t.report.loading}</div>;
    }
    if (!previewData) {
      return <div className="report-status">{t.report.selectPeriodPrompt}</div>;
    }
    if (previewData.overview.length === 0 || previewData.categories.length === 0) {
      return <div className="report-status">{t.report.noData}</div>;
    }

    const { overview, categories, unit } = previewData;
    const totals = {};
    categories.forEach((cat) => {
      totals[cat] = overview.reduce((sum, row) => sum + (row[cat] ?? 0), 0);
    });

    const energyLabel = t.monitorTabs[energyType];
    const tag = selectedCategories === 'ALL' ? t.report.allTag : selectedCategories.length;

    return (
      <div className="report-table-wrap">
        <div className="report-table-title">
          [{tag}] {t.report.titleUnit(energyLabel, unit)}
        </div>
        <table className="report-table">
          <thead>
            <tr>
              <th>{t.report.time}</th>
              {categories.map((cat) => (
                <th key={cat}>{cat}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {overview.map((row) => (
              <tr key={row.time}>
                <td>{row.time}</td>
                {categories.map((cat) => (
                  <td key={cat}>{row[cat] ?? '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>{t.report.total}</td>
              {categories.map((cat) => (
                <td key={cat}>{Math.round(totals[cat] * 100) / 100}</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  if (activePage === 'history') {
    return (
      <div className="main-area">
        {renderReportToolbar()}
        {renderReportTable()}
      </div>
    );
  }

  const url = activePage === 'monitor' ? MONITOR_DASHBOARDS[monitorTab] : DASHBOARDS[activePage];

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