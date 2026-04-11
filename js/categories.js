import { CATEGORIES } from './config.js';
import { refreshEvents } from './calendar.js';

export function buildCategories() {
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
