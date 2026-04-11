import { buildCategories } from './categories.js';
import { initMiniCalendar, setCalendar } from './mini-calendar.js';
import { initModalHandlers } from './modal.js';
import { initPopupHandlers } from './popup.js';
import { initCalendar } from './calendar.js';

document.addEventListener('DOMContentLoaded', () => {
  buildCategories();
  initMiniCalendar();
  initModalHandlers();
  initPopupHandlers();
  
  const calendar = initCalendar();
  setCalendar(calendar);
});
