export let events = JSON.parse(localStorage.getItem('cal_events') || '[]');

export function saveEvents() {
  localStorage.setItem('cal_events', JSON.stringify(events));
}

export function addEvent(event) {
  events.push(event);
  saveEvents();
}

export function updateEvent(id, updatedData) {
  const idx = events.findIndex(e => e.id === id);
  if (idx !== -1) {
    events[idx] = { ...events[idx], ...updatedData };
    saveEvents();
    return true;
  }
  return false;
}

export function deleteEvent(id) {
  events = events.filter(e => e.id !== id);
  saveEvents();
}

export function getEvent(id) {
  return events.find(e => e.id === id);
}
