// --- Theme Toggle ---
const toggle = document.getElementById('theme-toggle');
const saved = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', saved);
toggle.textContent = saved === 'dark' ? '🌙' : '☀️';

toggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  toggle.textContent = next === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('theme', next);
});

// --- Scroll Reveal ---
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('section').forEach(section => {
  section.classList.add('reveal');
  observer.observe(section);
});

// --- CTA Press Effect ---
document.querySelector('.cta').addEventListener('click', function () {
  this.style.transform = 'scale(0.95)';
  setTimeout(() => { this.style.transform = ''; }, 150);
});

// --- GitHub: Fetch repos sorted by last update ---
const GITHUB_USER = 'jsalas19';
const MAX_CARDS = 3;

// Only show these repos (by name)
const SHOW_REPOS = [
  'CS4375',
  'EthicalProject-again-2',
  'SnakeGame2.0',
  'TicTacToe',
];

let repos = [];

async function loadRepos() {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated&direction=desc`);
    const data = await res.json();

    repos = data
      .filter(r => r.fork === false)
      .filter(r => SHOW_REPOS.includes(r.name));

    // Render cards on index.html only
    const projectsGrid = document.getElementById('projects-grid');
    if (projectsGrid) {
      const top = repos.slice(0, MAX_CARDS);
      projectsGrid.innerHTML = top.map((r, i) => `
        <div class="project-card">
          <h3>${r.name}</h3>
          <p>${r.description || 'No description.'}</p>
          <span class="repo-stats">⭐ ${r.stargazers_count}  🍴 ${r.forks_count}  ·  Updated ${new Date(r.updated_at).toLocaleDateString()}</span>
          <span class="view-link">View Project →</span>
          <a class="card-overlay" href="${r.html_url}" target="_blank" aria-label="View ${r.name}"></a>
        </div>
      `).join('');
    }

    // Load commits for the sidebar
    fetchCommits();
  } catch (err) {
    console.error('Failed to load repos:', err);
  }
}

async function fetchCommits() {
  const commitsContainer = document.getElementById('commits-list');
  if (!commitsContainer) return;

  const allCommits = [];

  for (const r of repos.slice(0, 3)) {
    try {
      const res = await fetch(`https://api.github.com/repos/${r.owner.login}/${r.name}/commits?per_page=5`);
      const data = await res.json();
      data.forEach(c => allCommits.push({
        repo: r.name,
        msg: c.commit.message.split('\n')[0],
        date: c.commit.author.date,
        sha: c.sha.slice(0, 7),
      }));
    } catch {}
  }

  allCommits.sort((a, b) => new Date(b.date) - new Date(a.date));
  const top = allCommits.slice(0, 10);

  commitsContainer.innerHTML = top.map(c => `
    <div class="commit-item">
      <div class="commit-msg" title="${c.msg}">${c.msg}</div>
      <div class="commit-meta">${c.repo} · ${c.sha} · ${new Date(c.date).toLocaleDateString()}</div>
    </div>
  `).join('');
}

// --- Projects Page: Menu + README Viewer ---
async function loadReadme(index) {
  const r = repos[index];
  const readmeViewer = document.getElementById('readme-viewer');
  if (!readmeViewer) return;

  readmeViewer.innerHTML = '<div class="readme-placeholder">Loading…</div>';

  try {
    const res = await fetch(`https://api.github.com/repos/${r.owner.login}/${r.name}/readme`);
    if (!res.ok) throw new Error('No README');
    const data = await res.json();

    const raw = atob(data.content);
    readmeViewer.innerHTML = marked.parse(raw);
  } catch {
    readmeViewer.innerHTML = `<div class="readme-placeholder">No README for <strong>${r.name}</strong></div>`;
  }
}

if (document.getElementById('project-menu')) {
  const projectMenu = document.getElementById('project-menu');

  const buildMenu = () => {
    if (repos.length === 0) { setTimeout(buildMenu, 100); return; }

    projectMenu.innerHTML = '<h3>Projects</h3>' + repos.map((r, i) =>
      `<a href="#" data-index="${i}" class="${i === 0 ? 'active' : ''}">${r.name}</a>`
    ).join('');

    projectMenu.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-index]');
      if (!link) return;
      e.preventDefault();

      projectMenu.querySelectorAll('a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');

      loadReadme(parseInt(link.dataset.index));
    });

    loadReadme(0);
  };

  buildMenu();
}

// --- Init ---
loadRepos();   

// --- Education Accordion ---
document.querySelectorAll('.edu-header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.parentElement;
    item.classList.toggle('open');
  });
});   