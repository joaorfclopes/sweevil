import i18n from '../i18n';

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => (o ?? {})[k], obj);
}

function descendingComparator(a, b, key) {
  const va = getNestedValue(a, key);
  const vb = getNestedValue(b, key);
  if (vb < va) return -1;
  if (vb > va) return 1;
  return 0;
}

export function getComparator(sortDir, orderBy) {
  return sortDir === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function downloadCSV(headers, rows, filename) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function statusChipProps(status) {
  const colorMap = {
    IN_PROGRESS: '#ed6c02',
    CONFIRMED: '#2e7d32',
    PENDING_PAYMENT: '#ed6c02',
    PENDING: '#ed6c02',
    CANCELED: '#d32f2f',
    CANCELED_REFUNDED: '#2e7d32',
    CANCELED_NO_REFUND: '#d32f2f',
    CANCELED_PENDING_REFUND: '#ed6c02',
    SENT: '#1565c0',
    PAID: '#2e7d32',
    DELIVERED: '#2e7d32',
  };
  const key = status?.toUpperCase();
  const bg = colorMap[key] ?? '#757575';
  const label = key ? (i18n.t(`status.${key}`) ?? status) : '—';
  return {
    label,
    sx: { backgroundColor: bg, color: '#fff', fontWeight: 600 },
  };
}

export function isNewRow(item) {
  const ts = new Date(item.createdAt).getTime();
  return ts > 0 && Date.now() - ts < 86_400_000;
}

export function normalize(str) {
  return String(str ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}
