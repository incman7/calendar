import { supabase } from './supabase.js';

// ─── In-memory event list (hydrated from localStorage on startup) ─────────────
export let events = JSON.parse(localStorage.getItem('cal_events') || '[]');

// ─── Offline sync queue (persisted so it survives page reloads) ──────────────
let syncQueue = JSON.parse(localStorage.getItem('cal_sync_queue') || '[]');

function _saveSyncQueue() {
  localStorage.setItem('cal_sync_queue', JSON.stringify(syncQueue));
}

export function saveEvents() {
  localStorage.setItem('cal_events', JSON.stringify(events));
}

// ─── Remote helpers ──────────────────────────────────────────────────────────
async function _getUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function _execOp(op, user) {
  if (op.type === 'upsert') {
    const { error } = await supabase
      .from('events')
      .upsert({ ...op.event, user_id: user.id });
    if (error) throw error;
  } else if (op.type === 'delete') {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', op.id)
      .eq('user_id', user.id);
    if (error) throw error;
  }
}

// Drains the queue — stops at the first failure (retries on next flush).
async function flushQueue() {
  if (!supabase || syncQueue.length === 0) return;
  const user = await _getUser();
  if (!user) return;
  while (syncQueue.length > 0) {
    try {
      await _execOp(syncQueue[0], user);
      syncQueue.shift();
      _saveSyncQueue();
    } catch {
      break;
    }
  }
}

// Flush whenever the browser comes back online.
window.addEventListener('online', flushQueue);

function _queueOp(op) {
  syncQueue.push(op);
  _saveSyncQueue();
  flushQueue();
}

// ─── Public CRUD ─────────────────────────────────────────────────────────────
export function addEvent(event) {
  events.push(event);
  saveEvents();
  _queueOp({ type: 'upsert', event: { ...event } });
}

export function updateEvent(id, updatedData) {
  const idx = events.findIndex(e => e.id === id);
  if (idx !== -1) {
    events[idx] = { ...events[idx], ...updatedData };
    saveEvents();
    _queueOp({ type: 'upsert', event: { ...events[idx] } });
    return true;
  }
  return false;
}

export function deleteEvent(id) {
  events = events.filter(e => e.id !== id);
  saveEvents();
  _queueOp({ type: 'delete', id });
}

export function getEvent(id) {
  return events.find(e => e.id === id);
}

// ─── Remote sync (called after sign-in) ──────────────────────────────────────
/**
 * 1. Flush any locally-queued mutations (offline changes made before sign-in).
 * 2. Pull the full remote event list and replace localStorage.
 */
export async function initSync() {
  await flushQueue();
  const user = await _getUser();
  if (!user) return;
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id);
  if (error || !data) return;
  // Strip server-only columns before storing locally
  events = data.map(({ user_id, created_at, ...ev }) => ev);
  saveEvents();
}
