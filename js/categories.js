import { CATEGORIES } from './config.js';
import { refreshEvents } from './calendar.js';

function saveCategoryVisibility() {
  const vis = {};
  CATEGORIES.forEach(c => { vis[c.bg] = c.visible; });
  localStorage.setItem('cal_category_vis', JSON.stringify(vis));
}

export function buildCategories() {
  const list = document.getElementById('categoryList');
  list.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const item = document.createElement('label');
    item.className = 'category-item';
    item.style.opacity = cat.visible ? '1' : '0.4';
    item.innerHTML = `
      <div class="cat-dot" style="background:${cat.bg}"></div>
      <span>${cat.name}</span>
      <span class="cat-check">&#10003;</span>
    `;
    item.onclick = () => {
      cat.visible = !cat.visible;
      item.style.opacity = cat.visible ? '1' : '0.4';
      saveCategoryVisibility();
      refreshEvents();
    };
    list.appendChild(item);
  });
}
