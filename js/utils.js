export function toLocalDT(date) {
  if (!date) return '';
  const d = new Date(date);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatTime(start, end) {
  const opts = { hour: 'numeric', minute: '2-digit', hour12: true };
  const s = new Date(start).toLocaleTimeString([], opts);
  if (!end) return s;
  const e = new Date(end).toLocaleTimeString([], opts);
  const sDate = new Date(start).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  return `${sDate} · ${s} – ${e}`;
}

export function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}
