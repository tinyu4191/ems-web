const GRAFANA_URL = process.env.REACT_APP_GRAFANA_DEV_URL || '/grafana';

export const DASHBOARDS = {
  energy: `${GRAFANA_URL}/d/energy-overview/energy-overview?orgId=1&from=now%2Fd&to=now&timezone=browser&var-meterType=electricity&refresh=1m&kiosk`,
  demand: null,
  tariff: null,
  monitor: null, // monitor 改用 MONITOR_DASHBOARDS，這裡不再直接使用
  history: `${GRAFANA_URL}/d/report-electricity/report-electricity?orgId=1&kiosk=true&var-report_period=today&var-zone=$__all`,
  alert: null,
};

// monitor 頁面下的子分頁 dashboard
export const MONITOR_DASHBOARDS = {
  electricity: `${GRAFANA_URL}/d/eci-layout-electricity/eci-layout-electricity?orgId=1&from=now-1m&to=now&timezone=browser&refresh=10s&kiosk`,
  water: `${GRAFANA_URL}/d/eci-layout-water/eci-layout-water?orgId=1&from=now-1m&to=now&timezone=browser&refresh=10s&kiosk`,
  steam: `${GRAFANA_URL}/d/eci-layout-steam/eci-layout-steam?orgId=1&from=now-1m&to=now&timezone=browser&refresh=10s&kiosk`,
};

// 子分頁的顯示順序與 key，供 MainArea 迭代渲染按鈕
export const MONITOR_TABS = ['electricity', 'water', 'steam'];