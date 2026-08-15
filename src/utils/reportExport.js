// src/utils/reportExport.js
//
// 不透過後端，直接呼叫 Grafana 自己的 Query API 取得報表資料，
// 前端組成 CSV 觸發下載。適用場景：站內、同源（nginx 代理 /grafana）、
// Grafana 匿名 Viewer 權限已開放查詢。
//
// 資料流程：
//   1. 抓 dashboard JSON，取出報表面板存的 rawSql（單一真相來源，不在前端重複寫 SQL）
//   2. 手動做 Grafana 變數的文字代換（$report_period / $zone），比照 Grafana 自己代換的規則
//   3. POST /api/ds/query 執行查詢
//   4. 解析回傳的 dataframe，轉成 CSV 字串，觸發瀏覽器下載

const GRAFANA_URL = process.env.REACT_APP_GRAFANA_DEV_URL || '/grafana';
const DASHBOARD_UID = 'report-electricity';
const DATASOURCE_UID = 'ems-timescaledb';

/**
 * 抓 dashboard JSON，取出報表面板（假設是第一個 panel）的 rawSql。
 * 這樣 SQL 永遠只存在 Grafana 面板裡一份，不會跟前端程式碼各自維護一份、久了對不上。
 */
async function fetchReportRawSql() {
  const res = await fetch(`${GRAFANA_URL}/api/dashboards/uid/${DASHBOARD_UID}`);
  if (!res.ok) {
    throw new Error(`無法讀取報表 dashboard 設定（HTTP ${res.status}）`);
  }
  const json = await res.json();
  const panel = json.dashboard?.panels?.[0];
  const rawSql = panel?.targets?.[0]?.rawSql;
  if (!rawSql) {
    throw new Error('在 dashboard JSON 裡找不到報表面板的 SQL，請確認 dashboard 結構是否變動過');
  }
  return rawSql;
}

/**
 * 比照 Grafana 對 SQL 變數的預設代換規則：
 * - 單一值變數：直接代換成加引號的字串
 * - 多選變數（zone）：selectedZones 為陣列時，代換成 'A','B','C' 這種逗號分隔、各自加引號的清單；
 *   若包含 'ALL' 代表全選，改用「不加條件」的方式處理（見呼叫端）
 */
function substituteVariables(rawSql, reportPeriod, selectedZones) {
  let sql = rawSql;

  sql = sql.replaceAll("'$report_period'", `'${reportPeriod}'`);

  if (selectedZones === 'ALL' || (Array.isArray(selectedZones) && selectedZones.length === 0)) {
    // 全選：把 "AND m.zone IN ($zone)" 這個條件整段拿掉，等同不篩選
    sql = sql.replace(/\s*AND\s+m\.zone\s+IN\s*\(\$zone\)/i, '');
  } else {
    const zoneList = selectedZones.map((z) => `'${z.replace(/'/g, "''")}'`).join(',');
    sql = sql.replace('($zone)', `(${zoneList})`);
  }

  return sql;
}

/**
 * 呼叫 Grafana Query API 執行查詢，回傳解析後的資料列（array of row objects）。
 */
async function runQuery(rawSql) {
  const body = {
    queries: [
      {
        refId: 'A',
        datasource: { type: 'grafana-postgresql-datasource', uid: DATASOURCE_UID },
        rawSql,
        format: 'table',
      },
    ],
    // SQL 自己算時間範圍（見 params CTE），這裡的 range 不影響查詢結果，給寬鬆值即可
    from: 'now-5y',
    to: 'now',
  };

  const res = await fetch(`${GRAFANA_URL}/api/ds/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`查詢報表資料失敗（HTTP ${res.status}）：${text}`);
  }

  const json = await res.json();
  const frame = json.results?.A?.frames?.[0];
  if (!frame) {
    throw new Error('查詢結果格式異常，找不到 data frame');
  }

  const fields = frame.schema.fields.map((f) => f.name);
  const columns = frame.data.values; // 每個欄位一個陣列，欄位順序對應 fields
  const rowCount = columns[0]?.length || 0;

  const rows = [];
  for (let i = 0; i < rowCount; i++) {
    const row = {};
    fields.forEach((name, colIdx) => {
      row[name] = columns[colIdx][i];
    });
    rows.push(row);
  }

  return { fields, rows };
}

/**
 * 把資料列轉成 CSV 字串。手動實作，不依賴額外套件。
 * 加 UTF-8 BOM，確保 Excel 開啟中文欄位不會亂碼。
 */
function toCSV(fields, rows) {
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = fields.map(escapeCell).join(',');
  const lines = rows.map((row) => fields.map((f) => escapeCell(row[f])).join(','));
  return '\uFEFF' + [header, ...lines].join('\n');
}

function triggerDownload(csvString, filename) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const PERIOD_LABELS = {
  today: '今日',
  this_week: '本週',
  this_month: '本月',
  last_week: '上週',
  last_month: '上個月',
};

/**
 * 主要對外函式：下載目前選定期間/區域的用電報表 CSV。
 * @param {string} reportPeriod - 'today' | 'this_week' | 'this_month' | 'last_week' | 'last_month'
 * @param {'ALL'|string[]} selectedZones - 'ALL' 代表全選，否則傳區域名稱陣列
 */
export async function downloadElectricityReportCSV(reportPeriod, selectedZones) {
  const rawSql = await fetchReportRawSql();
  const finalSql = substituteVariables(rawSql, reportPeriod, selectedZones);
  const { fields, rows } = await runQuery(finalSql);

  if (rows.length === 0) {
    throw new Error('查無資料，請確認選擇的期間內是否有電表數據');
  }

  const csv = toCSV(fields, rows);
  const periodLabel = PERIOD_LABELS[reportPeriod] || reportPeriod;
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `ECI用電報表_${periodLabel}_${dateStr}.csv`;
  triggerDownload(csv, filename);
}

/**
 * 取得所有電力區域清單（給區域選擇器用），直接查 meters table，
 * 跟報表 SQL 用同一個資料來源，不會跟資料庫內容脫節。
 */
export async function fetchElectricityZones() {
  const rawSql = `
    SELECT DISTINCT zone FROM meters
    WHERE meter_type = 'electricity' AND is_main = FALSE
    ORDER BY zone;
  `;
  const { rows } = await runQuery(rawSql);
  return rows.map((r) => r.zone);
}