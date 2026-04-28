export const COLORS = [
  { name: 'Blue',   bg: '#2d5be3', light: '#eef1fd' },
  { name: 'Coral',  bg: '#e85d30', light: '#fdf1ed' },
  { name: 'Green',  bg: '#1a7a4a', light: '#edf7f2' },
  { name: 'Purple', bg: '#6b3fa0', light: '#f3eefa' },
  { name: 'Amber',  bg: '#b45309', light: '#fef8ec' },
  { name: 'Pink',   bg: '#c2185b', light: '#fce4ec' },
  { name: 'Teal',   bg: '#00796b', light: '#e0f2f1' },
  { name: 'Gray',   bg: '#455a64', light: '#eceff1' },
];

const _savedVis = JSON.parse(localStorage.getItem('cal_category_vis') || '{}');
export const CATEGORIES = COLORS.map(c => ({ ...c, visible: _savedVis[c.bg] !== false }));

export const DAYS = ['S','M','T','W','T','F','S'];
export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
