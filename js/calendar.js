import { CATEGORIES } from './config.js';
import { events, updateEvent } from './storage.js';
import { showToast } from './utils.js';
import { openModal } from './modal.js';
import { showPopup, hidePopup } from './popup.js';
import { renderMini, setMiniDate } from './mini-calendar.js';

let calendar = null;

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

export function refreshEvents() {
  if (!calendar) return;
  calendar.removeAllEvents();
  const visible = new Set(CATEGORIES.filter(c => c.visible).map(c => c.bg));
  events.forEach(ev => {
    if (visible.has(ev.color)) {
      calendar.addEvent(fcEvent(ev));
    }
  });
}

export function updateTitle() {
  if (!calendar) return;
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

export function initCalendar() {
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
      updateEvent(info.event.id, {
        start: info.event.startStr,
        end: info.event.endStr
      });
      showToast('Event moved');
    },

    eventResize: info => {
      updateEvent(info.event.id, {
        start: info.event.startStr,
        end: info.event.endStr
      });
      showToast('Event resized');
    },

    datesSet: updateTitle,
  });

  calendar.render();
  updateTitle();

  // Nav buttons
  document.getElementById('todayBtn').onclick = () => { 
    calendar.today(); 
    setMiniDate(new Date()); 
    renderMini(); 
  };
  document.getElementById('prevBtn').onclick = () => { 
    calendar.prev(); 
    updateTitle(); 
  };
  document.getElementById('nextBtn').onclick = () => { 
    calendar.next(); 
    updateTitle(); 
  };

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
    if (e.key === 'Escape') { 
      document.getElementById('modalOverlay').classList.remove('open');
      hidePopup(); 
    }
    if (e.key === 'n' && !e.target.matches('input,textarea')) openModal();
  });

  return calendar;
}

export function getCalendar() {
  return calendar;
}
