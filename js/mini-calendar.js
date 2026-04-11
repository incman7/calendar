import { DAYS, MONTHS } from './config.js';
import { updateTitle } from './calendar.js';

let miniDate = new Date();
let calendar = null;

export function setCalendar(cal) {
  calendar = cal;
}

export function renderMini() {
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
      if (calendar) {
        calendar.gotoDate(new Date(miniDate.getFullYear(), miniDate.getMonth(), d));
        updateTitle();
      }
    };
    grid.appendChild(el);
  }
}

export function initMiniCalendar() {
  renderMini();
  
  document.getElementById('miniPrev').onclick = () => { 
    miniDate.setMonth(miniDate.getMonth() - 1); 
    renderMini(); 
  };
  
  document.getElementById('miniNext').onclick = () => { 
    miniDate.setMonth(miniDate.getMonth() + 1); 
    renderMini(); 
  };
}

export function getMiniDate() {
  return miniDate;
}

export function setMiniDate(date) {
  miniDate = date;
}
