'use strict';

const grid = document.querySelector('#project-grid');
const cards = [...grid.querySelectorAll('.project')];
const filters = [...document.querySelectorAll('.project-filters button')];
const status = document.querySelector('#project-status');
const more = document.querySelector('#project-more');
const dialog = document.querySelector('#project-dialog');
const dialogTitle = document.querySelector('#project-dialog-title');
const dialogBody = dialog.querySelector('.project-dialog-body');
const initialLimit = 6;
let category = 'all';
let expanded = false;

function renderProjects() {
  const matching = cards.filter(card => category === 'all' || card.dataset.category === category);
  const visible = expanded ? matching : matching.slice(0, initialLimit);

  for (const card of cards) card.hidden = !visible.includes(card);
  for (const filter of filters) filter.setAttribute('aria-pressed', String(filter.dataset.filter === category));
  more.hidden = matching.length <= initialLimit;
  more.setAttribute('aria-expanded', String(expanded));
  more.textContent = expanded ? '收起项目' : '展开更多';
  status.textContent = matching.length === visible.length
    ? `共 ${matching.length} 个项目`
    : `显示 ${visible.length} 个项目，共 ${matching.length} 个`;
}

function revealProject(hash) {
  const card = cards.find(project => `#${project.id}` === hash);
  if (!card?.hidden) return;

  category = 'all';
  expanded = cards.indexOf(card) >= initialLimit;
  renderProjects();
  card.scrollIntoView();
}

document.querySelector('#print-resume').addEventListener('click', () => window.print());

for (const filter of filters) {
  filter.addEventListener('click', () => {
    if (category === filter.dataset.filter) return;
    category = filter.dataset.filter;
    expanded = false;
    renderProjects();
  });
}

more.addEventListener('click', () => {
  expanded = !expanded;
  renderProjects();
});

grid.addEventListener('click', event => {
  const trigger = event.target.closest('.project-open');
  if (!trigger) return;

  const detail = document.getElementById(`detail-${trigger.closest('.project').id}`);
  dialogTitle.textContent = trigger.firstChild.textContent.trim();
  dialogBody.replaceChildren(detail.content.cloneNode(true));
  dialog.showModal();
  dialog.scrollTop = 0;
});

document.querySelector('#project-close').addEventListener('click', () => dialog.close());

let pointerStartedOnBackdrop = false;
dialog.addEventListener('pointerdown', event => {
  pointerStartedOnBackdrop = event.target === dialog;
});
dialog.addEventListener('click', event => {
  if (pointerStartedOnBackdrop && event.target === dialog) dialog.close();
  pointerStartedOnBackdrop = false;
});
dialog.addEventListener('close', () => {
  pointerStartedOnBackdrop = false;
});

document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (link && !event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
    revealProject(link.hash);
  }
});
window.addEventListener('hashchange', () => revealProject(location.hash));

renderProjects();
revealProject(location.hash);
