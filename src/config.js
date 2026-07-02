const GRAFANA = process.env.REACT_APP_GRAFANA_URL || 'http://localhost:3000';

export const GRAFANA_URL = GRAFANA;

export const GRAFANA_CREDS = {
  user: 'admin',
  password: 'ems123456',
};

export const DASHBOARDS = {
  energy: `${GRAFANA}/d/efqlpknamo8owb/water-overview?orgId=1&from=now%2Fd&to=now&timezone=browser&refresh=10s&kiosk`,
  demand: null,
  tariff: null,
  history: null,
  alert: null,
};