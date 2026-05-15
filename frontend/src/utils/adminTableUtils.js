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
  const map = {
    CONFIRMED: { bg: '#2e7d32', label: 'Confirmed' },
    PENDING_PAYMENT: { bg: '#ed6c02', label: 'Pending Payment' },
    PENDING: { bg: '#ed6c02', label: 'Pending' },
    CANCELED: { bg: '#d32f2f', label: 'Canceled' },
    SENT: { bg: '#1565c0', label: 'Sent' },
    PAID: { bg: '#2e7d32', label: 'Paid' },
    DELIVERED: { bg: '#2e7d32', label: 'Delivered' },
  };
  const key = status?.toUpperCase();
  const entry = map[key] ?? { bg: '#757575', label: status ?? '—' };
  return {
    label: entry.label,
    sx: { backgroundColor: entry.bg, color: '#fff', fontWeight: 600 },
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
