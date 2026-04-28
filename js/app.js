import { buildCategories } from './categories.js';
import { initMiniCalendar, setCalendar } from './mini-calendar.js';
import { initModalHandlers } from './modal.js';
import { initPopupHandlers } from './popup.js';
import { initCalendar, refreshEvents } from './calendar.js';
import { initAuth, initAuthHandlers } from './auth.js';
import { initSync } from './storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  buildCategories();
  initMiniCalendar();
  initModalHandlers();
  initPopupHandlers();

  const calendar = initCalendar();
  setCalendar(calendar);

  initAuthHandlers();

  await initAuth(
    async () => {
      // Signed in: push any offline queued changes then pull remote events
      await initSync();
      refreshEvents();
    },
    () => {
      // Not signed in (or Supabase not configured): use local data as-is
    }
  );
});
