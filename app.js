const COLORS = [
  { name: 'Blue',   bg: '#2d5be3', light: '#eef1fd' },
  { name: 'Coral',  bg: '#e85d30', light: '#fdf1ed' },
  { name: 'Green',  bg: '#1a7a4a', light: '#edf7f2' },
  { name: 'Purple', bg: '#6b3fa0', light: '#f3eefa' },
  { name: 'Amber',  bg: '#b45309', light: '#fef8ec' },
  { name: 'Pink',   bg: '#c2185b', light: '#fce4ec' },
  { name: 'Teal',   bg: '#00796b', light: '#e0f2f1' },
  { name: 'Gray',   bg: '#455a64', light: '#eceff1' },
];

const CATEGORIES = COLORS.map(c => ({ ...c, visible: true }));

let events = JSON.parse(localStorage.getItem('cal_events') || '[]');
let calendar;
let editingId = null;
let selectedColor = COLORS[0];
let popupEventId = null;

function saveEvents() {
  localStorage.setItem('cal_events', JSON.stringify(events));
}

function toLocalDT(date) {
  if (!date) return '';
  const d = new Date(date);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatTime(start, end) {
  const opts = { hour: 'numeric', minute: '2-digit', hour12: true };
  const s = new Date(start).toLocaleTimeString([], opts);
  if (!end) return s;
  const e = new Date(end).toLocaleTimeString([], opts);
  const sDate = new Date(start).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  return `${sDate} · ${s} – ${e}`;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// ── Color Picker ──
function buildColorPicker() {
  const row = document.getElementById('colorPicker');
  row.innerHTML = '';
  COLORS.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'color-opt' + (c === selectedColor ? ' selected' : '');
    btn.style.background = c.bg;
    btn.title = c.name;
    btn.onclick = () => {
      selectedColor = c;
      document.querySelectorAll('.color-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
    row.appendChild(btn);
  });
}

// ── Categories ──
function buildCategories() {
  const list = document.getElementById('categoryList');
  list.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const item = document.createElement('label');
    item.className = 'category-item';
    item.innerHTML = `
      <div class="cat-dot" style="background:${cat.bg}"></div>
      <span>${cat.name}</span>
      <span class="cat-check">&#10003;</span>
    `;
    item.onclick = () => {
      cat.visible = !cat.visible;
      item.style.opacity = cat.visible ? '1' : '0.4';
      refreshEvents();
    };
    list.appendChild(item);
  });
}

function refreshEvents() {
  calendar.removeAllEvents();
  const visible = new Set(CATEGORIES.filter(c => c.visible).map(c => c.bg));
  events.forEach(ev => {
    if (visible.has(ev.color)) {
      calendar.addEvent(fcEvent(ev));
    }
  });
}

function fcEvent(ev) {
  return {
    id: ev.id,
    title: ev.title,
    start: ev.start,
    end: ev.end,
    backgroundColor: ev.color,
    borderColor: ev.color,
    textColor: '#ffffff',
    extendedProps: { note: ev.note, colorBg: ev.color }
  };
}

// ── Modal ──
function openModal(opts = {}) {
  editingId = opts.id || null;
  document.getElementById('modalTitle').textContent = editingId ? 'Edit event' : 'New event';
  document.getElementById('evTitle').value = opts.title || '';
  document.getElementById('evStart').value = opts.start ? toLocalDT(opts.start) : toLocalDT(new Date());
  document.getElementById('evEnd').value = opts.end ? toLocalDT(opts.end) : toLocalDT(new Date(Date.now() + 3600000));
  document.getElementById('evNote').value = opts.note || '';
  document.getElementById('deleteBtn').style.display = editingId ? 'block' : 'none';
  selectedColor = COLORS.find(c => c.bg === opts.color) || COLORS[0];
  buildColorPicker();
  document.getElementById('modalOverlay').classList.add('open');
  setTimeout(() => document.getElementById('evTitle').focus(), 200);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

document.getElementById('modalClose').onclick = closeModal;
document.getElementById('cancelBtn').onclick = closeModal;
document.getElementById('modalOverlay').onclick = e => { if (e.target === e.currentTarget) closeModal(); };

document.getElementById('saveBtn').onclick = () => {
  const title = document.getElementById('evTitle').value.trim();
  if (!title) { document.getElementById('evTitle').focus(); return; }
  const start = document.getElementById('evStart').value;
  const end = document.getElementById('evEnd').value;
  const note = document.getElementById('evNote').value.trim();

  if (editingId) {
    const idx = events.findIndex(e => e.id === editingId);
    if (idx !== -1) {
      events[idx] = { ...events[idx], title, start, end, note, color: selectedColor.bg };
    }
    showToast('Event updated');
  } else {
    const newEv = { id: Date.now().toString(), title, start, end, note, color: selectedColor.bg };
    events.push(newEv);
    showToast('Event added');
  }
  saveEvents();
  refreshEvents();
  closeModal();
};

document.getElementById('deleteBtn').onclick = () => {
  if (!editingId) return;
  events = events.filter(e => e.id !== editingId);
  saveEvents();
  refreshEvents();
  closeModal();
  showToast('Event deleted');
};

document.getElementById('addEventBtn').onclick = () => openModal();

// ── Event popup ──
function showPopup(ev, jsEvent) {
  const popup = document.getElementById('eventPopup');
  const evData = events.find(e => e.id === ev.id);
  if (!evData) return;
  popupEventId = ev.id;

  document.getElementById('popupBar').style.background = evData.color;
  document.getElementById('popupTitle').textContent = evData.title;
  document.getElementById('popupTime').textContent = formatTime(evData.start, evData.end);

  const noteEl = document.getElementById('popupNote');
  if (evData.note) {
    noteEl.textContent = evData.note;
    noteEl.style.display = 'block';
  } else {
    noteEl.style.display = 'none';
  }

  popup.style.display = 'block';
  const rect = jsEvent.target.getBoundingClientRect();
  let left = rect.right + 10;
  let top = rect.top;
  if (left + 290 > window.innerWidth) left = rect.left - 290;
  if (top + 200 > window.innerHeight) top = window.innerHeight - 220;
  popup.style.left = left + 'px';
  popup.style.top = top + 'px';
}

function hidePopup() {
  document.getElementById('eventPopup').style.display = 'none';
  popupEventId = null;
}

document.getElementById('popupEdit').onclick = () => {
  const evData = events.find(e => e.id === popupEventId);
  if (evData) { hidePopup(); openModal(evData); }
};

document.getElementById('popupDelete').onclick = () => {
  if (!popupEventId) return;
  events = events.filter(e => e.id !== popupEventId);
  saveEvents();
  refreshEvents();
  hidePopup();
  showToast('Event deleted');
};

document.addEventListener('click', e => {
  if (!document.getElementById('eventPopup').contains(e.target) &&
      !e.target.closest('.fc-event')) {
    hidePopup();
  }
});

// ── Mini calendar ──
let miniDate = new Date();
const DAYS = ['S','M','T','W','T','F','S'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function renderMini() {
  document.getElementById('miniMonth').textContent = `${MONTHS[miniDate.getMonth()]} ${miniDate.getFullYear()}`;
  const grid = document.getElementById('miniGrid');
  grid.innerHTML = '';
  DAYS.forEach(d => {
    const el = document.createElement('div');
    el.className = 'mini-day-label';
    el.textContent = d;
    grid.appendChild(el);
  });
  const first = new Date(miniDate.getFullYear(), miniDate.getMonth(), 1);
  const last = new Date(miniDate.getFullYear(), miniDate.getMonth() + 1, 0);
  const today = new Date();
  for (let i = 0; i < first.getDay(); i++) {
    const blank = document.createElement('div');
    blank.className = 'mini-day other-month';
    const d = new Date(miniDate.getFullYear(), miniDate.getMonth(), -first.getDay() + i + 1);
    blank.textContent = d.getDate();
    grid.appendChild(blank);
  }
  for (let d = 1; d <= last.getDate(); d++) {
    const el = document.createElement('div');
    el.className = 'mini-day';
    const isToday = d === today.getDate() && miniDate.getMonth() === today.getMonth() && miniDate.getFullYear() === today.getFullYear();
    if (isToday) el.classList.add('today');
    el.textContent = d;
    el.onclick = () => {
      calendar.gotoDate(new Date(miniDate.getFullYear(), miniDate.getMonth(), d));
      updateTitle();
    };
    grid.appendChild(el);
  }
}

document.getElementById('miniPrev').onclick = () => { miniDate.setMonth(miniDate.getMonth() - 1); renderMini(); };
document.getElementById('miniNext').onclick = () => { miniDate.setMonth(miniDate.getMonth() + 1); renderMini(); };

// ── FullCalendar init ──
function updateTitle() {
  const d = calendar.getDate();
  const view = calendar.view.type;
  if (view === 'timeGridWeek') {
    const start = calendar.view.activeStart;
    const end = new Date(calendar.view.activeEnd - 1);
    const s = start.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const e = end.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    document.getElementById('calTitle').textContent = `${s} – ${e}`;
  } else if (view === 'timeGridDay') {
    document.getElementById('calTitle').textContent = d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  } else {
    document.getElementById('calTitle').textContent = d.toLocaleDateString([], { month: 'long', year: 'numeric' });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  buildCategories();
  renderMini();
  buildColorPicker();

  calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
    initialView: 'timeGridWeek',
    headerToolbar: false,
    height: 'auto',
    editable: true,
    selectable: true,
    selectMirror: true,
    nowIndicator: true,
    scrollTime: '07:00:00',
    slotMinTime: '00:00:00',
    slotMaxTime: '24:00:00',
    allDaySlot: true,
    firstDay: 1,
    eventDurationEditable: true,

    events: events.map(fcEvent),

    select: info => {
      openModal({ start: info.startStr, end: info.endStr });
      calendar.unselect();
    },

    eventClick: info => {
      info.jsEvent.stopPropagation();
      showPopup(info.event, info.jsEvent);
    },

    eventDrop: info => {
      const idx = events.findIndex(e => e.id === info.event.id);
      if (idx !== -1) {
        events[idx].start = info.event.startStr;
        events[idx].end = info.event.endStr;
        saveEvents();
        showToast('Event moved');
      }
    },

    eventResize: info => {
      const idx = events.findIndex(e => e.id === info.event.id);
      if (idx !== -1) {
        events[idx].start = info.event.startStr;
        events[idx].end = info.event.endStr;
        saveEvents();
        showToast('Event resized');
      }
    },

    datesSet: updateTitle,
  });

  calendar.render();
  updateTitle();

  // Nav buttons
  document.getElementById('todayBtn').onclick = () => { calendar.today(); miniDate = new Date(); renderMini(); };
  document.getElementById('prevBtn').onclick = () => { calendar.prev(); updateTitle(); };
  document.getElementById('nextBtn').onclick = () => { calendar.next(); updateTitle(); };

  // View tabs
  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      calendar.changeView(tab.dataset.view);
      updateTitle();
    };
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); hidePopup(); }
    if (e.key === 'n' && !e.target.matches('input,textarea')) openModal();
  });
});
