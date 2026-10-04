const repos = [
{ id: 'stats-1', owner: 'jsalas19', repo: 'EthicalProject-again-2' },
{ id: 'stats-2', owner: 'jsalas19', repo: 'TicTacToe' },
{ id: 'stats-3', owner: 'jsalas19', repo: 'SnakeGame2.0' },
{ id: 'stats-4', owner: 'jsalas19', repo: 'CS4375' }
];


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

repos.forEach(({ id, owner, repo }) => {
  fetch(`https://api.github.com/repos/${owner}/${repo}`)
    .then(r => r.json())
    .then(data => {
      document.getElementById(id).textContent =
        `⭐ ${data.stargazers_count}  🍴 ${data.forks_count}`;
    })
    .catch(() => {
      document.getElementById(id).textContent = '';
    });
});

// --- Recent Commits Sidebar ---
const commitsContainer = document.getElementById('commits-list');

async function fetchCommits() {
  const allCommits = [];

  for (const { owner, repo } of repos) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`
      );
      const data = await res.json();
      data.forEach(c => allCommits.push({
        repo,
        msg: c.commit.message.split('\n')[0],
        date: c.commit.author.date,
        sha: c.sha.slice(0, 7),
      }));
    } catch { /* skip */ }
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

fetchCommits();
