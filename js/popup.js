import { getEvent, deleteEvent } from './storage.js';
import { formatTime, showToast } from './utils.js';
import { openModal } from './modal.js';
import { refreshEvents } from './calendar.js';

let popupEventId = null;

export function showPopup(ev, jsEvent) {
  const popup = document.getElementById('eventPopup');
  const evData = getEvent(ev.id);
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

export function hidePopup() {
  document.getElementById('eventPopup').style.display = 'none';
  popupEventId = null;
}

export function initPopupHandlers() {
  document.getElementById('popupEdit').onclick = () => {
    const evData = getEvent(popupEventId);
    if (evData) { 
      hidePopup(); 
      openModal(evData); 
    }
  };

  document.getElementById('popupDelete').onclick = () => {
    if (!popupEventId) return;
    deleteEvent(popupEventId);
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
}
