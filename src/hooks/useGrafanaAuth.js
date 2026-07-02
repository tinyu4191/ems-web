import { useState, useEffect } from 'react';
import { GRAFANA_URL, GRAFANA_CREDS } from '../config';

export function useGrafanaAuth() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function login() {
      try {
        const res = await fetch(`/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',  // 關鍵：帶 cookie
          body: JSON.stringify({
            user: GRAFANA_CREDS.user,
            password: GRAFANA_CREDS.password,
          }),
        });

        if (res.ok) {
          setReady(true);
        } else {
          setError('Grafana 登入失敗');
        }
      } catch (e) {
        setError('無法連線至 Grafana');
      }
    }

    login();
  }, []);

  return { ready, error };
}