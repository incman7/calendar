import { COLORS } from './config.js';
import { addEvent, updateEvent, deleteEvent } from './storage.js';
import { toLocalDT, showToast } from './utils.js';
import { refreshEvents } from './calendar.js';

let editingId = null;
let selectedColor = COLORS[0];

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

export function openModal(opts = {}) {
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

export function initModalHandlers() {
  buildColorPicker();
  
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('cancelBtn').onclick = closeModal;
  document.getElementById('modalOverlay').onclick = e => { 
    if (e.target === e.currentTarget) closeModal(); 
  };

  document.getElementById('saveBtn').onclick = () => {
    const title = document.getElementById('evTitle').value.trim();
    if (!title) { 
      document.getElementById('evTitle').focus(); 
      return; 
    }
    const start = document.getElementById('evStart').value;
    const end = document.getElementById('evEnd').value;
    const note = document.getElementById('evNote').value.trim();

    if (editingId) {
      updateEvent(editingId, { title, start, end, note, color: selectedColor.bg });
      showToast('Event updated');
    } else {
      const newEv = { id: Date.now().toString(), title, start, end, note, color: selectedColor.bg };
      addEvent(newEv);
      showToast('Event added');
    }
    refreshEvents();
    closeModal();
  };

  document.getElementById('deleteBtn').onclick = () => {
    if (!editingId) return;
    deleteEvent(editingId);
    refreshEvents();
    closeModal();
    showToast('Event deleted');
  };

  document.getElementById('addEventBtn').onclick = () => openModal();
}
