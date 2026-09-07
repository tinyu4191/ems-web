// src/utils/energyReport.js
//
// 呼叫自建的 Fastify 報表 API（/api/reports/...），取代舊版直接打 Grafana Query API 的做法。
// 這支 API 同時支援電力、水兩種能源類型，且能產生 Overview + 各分類明細的多分頁 Excel。

// ---- 期間快捷選項的日期計算（皆用本機瀏覽器時間，工廠端瀏覽器即代表當地時區）----
function pad2(n) {
  return String(n).padStart(2, '0');
}

function toDateStr(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function computePeriodRange(period) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (period === 'today') {
    return { from: toDateStr(today), to: toDateStr(today) };
  }

  if (period === 'this_week' || period === 'last_week') {
    // getDay(): 0=週日...6=週六，換算成「週一為一週開始」
    const dow = today.getDay();
    const diffToMonday = dow === 0 ? 6 : dow - 1;
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() - diffToMonday);

    if (period === 'this_week') {
      return { from: toDateStr(thisMonday), to: toDateStr(today) };
    }
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(thisMonday.getDate() - 7);
    const lastSunday = new Date(thisMonday);
    lastSunday.setDate(thisMonday.getDate() - 1);
    return { from: toDateStr(lastMonday), to: toDateStr(lastSunday) };
  }

  if (period === 'this_month' || period === 'last_month') {
    const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (period === 'this_month') {
      return { from: toDateStr(firstOfThisMonth), to: toDateStr(today) };
    }
    const firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    return { from: toDateStr(firstOfLastMonth), to: toDateStr(lastOfLastMonth) };
  }

  // 預設回傳今天
  return { from: toDateStr(today), to: toDateStr(today) };
}

// ---- API 呼叫 ----

function buildParams({ energyType, from, to, categories }) {
  const params = new URLSearchParams({ energyType, from, to });
  if (categories && categories !== 'ALL' && categories.length > 0) {
    params.set('categories', categories.join(','));
  }
  return params;
}

export async function fetchCategories(energyType) {
  const res = await fetch(`/api/reports/categories?energyType=${energyType}`);
  if (!res.ok) throw new Error(`無法取得分類清單（HTTP ${res.status}）`);
  const json = await res.json();
  return json.categories.map((c) => c.value);
}

export async function fetchReportPreview({ energyType, from, to, categories }) {
  const params = buildParams({ energyType, from, to, categories });
  params.set('format', 'json');
  const res = await fetch(`/api/reports/energy?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `查詢失敗（HTTP ${res.status}）`);
  }
  return res.json();
}

export async function downloadReportExcel({ energyType, from, to, categories }) {
  const params = buildParams({ energyType, from, to, categories });
  const res = await fetch(`/api/reports/energy?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `下載失敗（HTTP ${res.status}）`);
  }
  const blob = await res.blob();

  // 從 Content-Disposition 取出檔名，取不到就用預設值
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename\*=UTF-8''([^;]+)/);
  const filename = match ? decodeURIComponent(match[1]) : `ECI能源報表_${from}_${to}.xlsx`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
