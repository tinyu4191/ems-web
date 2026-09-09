const GRAFANA_URL = process.env.REACT_APP_GRAFANA_DEV_URL || '/grafana';

export const DASHBOARDS = {
  energy: `${GRAFANA_URL}/d/energy-overview/energy-overview?orgId=1&from=now%2Fd&to=now&timezone=browser&var-meterType=electricity&refresh=1m&kiosk`,
  demand: null,
  tariff: null,
  monitor: null, // monitor 改用 MONITOR_DASHBOARDS，這裡不再直接使用
  history: null, // 歷史報告已改為 React 自建頁面，不再透過此設定值
  alert: null,
};

// monitor 頁面下的子分頁 dashboard
export const MONITOR_DASHBOARDS = {
  electricity: `${GRAFANA_URL}/d/eci-layout-electricity/eci-layout-electricity?orgId=1&from=now-1m&to=now&timezone=browser&refresh=10s&kiosk`,
  water: `${GRAFANA_URL}/d/eci-layout-water/eci-layout-water?orgId=1&from=now-1m&to=now&timezone=browser&refresh=10s&kiosk`,
  steam: `${GRAFANA_URL}/d/eci-layout-steam/eci-layout-steam?orgId=1&from=now-1m&to=now&timezone=browser&refresh=10s&kiosk`,
};

// 太陽能監控平台由華為 FusionSolar 提供，該平台設定 X-Frame-Options: sameorigin，
// 禁止被其他網站以 iframe 嵌入，因此不走上面 MONITOR_DASHBOARDS 的 iframe 呈現方式，
// 改為在 MainArea 用連結卡片、以新分頁開啟。
export const SOLAR_EXTERNAL_URL =
  'https://intl.fusionsolar.huawei.com/uniportal/pvmswebsite/assets/build/cloud.html?app-id=smartpvms&instance-id=smartpvms&zone-id=d305fa6e-22ab-4181-ba13-6761af85d161#/view/station/NE=96020118/overview';

// 子分頁的顯示順序與 key，供 MainArea 迭代渲染按鈕
export const MONITOR_TABS = ['electricity', 'water', 'steam', 'solar'];