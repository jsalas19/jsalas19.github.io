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

// --- Scroll Progress Bar ---
const progressBar = document.getElementById('scroll-progress');

if (progressBar) {
  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  });
}

document.querySelectorAll('section').forEach(section => {
  section.classList.add('reveal');
  observer.observe(section);
});

// --- CTA Press Effect ---
document.querySelectorAll('.cta').forEach(button => {
  button.addEventListener('click', () => {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => { button.style.transform = ''; }, 150);
  });
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
  'ML-Song-Emotions-project'
];

let repos = [];

async function loadRepos() {
  const projectsGrid = document.getElementById('projects-grid');
  const commitsContainer = document.getElementById('commits-list');
  const projectMenu = document.getElementById('project-menu');

  if (projectsGrid) showMessage(projectsGrid, 'Loading projects…');
  if (commitsContainer) showMessage(commitsContainer, 'Loading recent commits…');

  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated&direction=desc`);
    if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('GitHub returned an unexpected repository list');

    repos = data
      
      .filter(r => SHOW_REPOS.includes(r.name));

    if (projectsGrid) {
      renderProjectCards(projectsGrid, repos.slice(0, MAX_CARDS));
    }

    if (projectMenu) renderProjectMenu(projectMenu);
    await fetchCommits();
  } catch (err) {
    console.error('Failed to load repos:', err);
    if (projectsGrid) showMessage(projectsGrid, 'Projects are unavailable right now. Please try again later.');
    if (projectMenu) showMessage(projectMenu, 'Projects could not be loaded. Please try again later.');
    if (commitsContainer) showMessage(commitsContainer, 'Recent commits are unavailable because the project list could not be loaded.');
  }
}

function showMessage(container, message) {
  const status = document.createElement('p');
  status.className = 'content-status';
  status.setAttribute('role', 'status');
  status.textContent = message;
  container.replaceChildren(status);
}

function createExternalLink(label, href, className) {
  let url;
  try {
    url = new URL(href);
  } catch {
    console.warn(`Skipped an invalid ${label.toLowerCase()} URL:`, href);
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  const link = document.createElement('a');
  link.className = className;
  link.href = url.href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = label;
  return link;
}

function renderProjectCards(container, projectRepos) {
  if (projectRepos.length === 0) {
    showMessage(container, 'No featured projects are available right now.');
    return;
  }

  const cards = projectRepos.map(repo => {
    const card = document.createElement('article');
    card.className = 'project-card';

    const title = document.createElement('h3');
    const repoLink = createExternalLink(repo.name, repo.html_url, 'project-link');
    if (repoLink) title.append(repoLink);
    else title.textContent = repo.name;
    card.append(title);

    const description = document.createElement('p');
    description.textContent = repo.description || 'Project details coming soon.';
    card.append(description);

    const stats = document.createElement('span');
    stats.className = 'repo-stats';
    const updated = new Date(repo.updated_at);
    const updatedText = Number.isNaN(updated.getTime()) ? '' : ` · Updated ${updated.toLocaleDateString()}`;
    stats.textContent = `⭐ ${repo.stargazers_count}  🍴 ${repo.forks_count}${updatedText}`;
    card.append(stats);

    const links = document.createElement('div');
    links.className = 'project-links';
    if (repoLink) {
      const sourceLink = createExternalLink('View source', repo.html_url, 'view-link');
      if (sourceLink) links.append(sourceLink);
    }
    if (repo.homepage) {
      const demoLink = createExternalLink('Live demo', repo.homepage, 'view-link');
      if (demoLink) links.append(demoLink);
    }
    if (links.childElementCount > 0) card.append(links);

    return card;
  });

  container.replaceChildren(...cards);
}

async function fetchCommits() {
  const commitsContainer = document.getElementById('commits-list');
  if (!commitsContainer) return;

  if (repos.length === 0) {
    showMessage(commitsContainer, 'No recent commits are available.');
    return;
  }

  const results = await Promise.all(repos.slice(0, 3).map(async repo => {
    try {
      const res = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?per_page=5`);
      if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('GitHub returned an unexpected commit list');
      return data.map(commit => ({
        repo: repo.name,
        msg: commit.commit.message.split('\n')[0],
        date: commit.commit.author.date,
        sha: commit.sha.slice(0, 7),
      }));
    } catch (err) {
      console.error(`Failed to load commits for ${repo.name}:`, err);
      return [];
    }
  }));

  const allCommits = results.flat();
  allCommits.sort((a, b) => new Date(b.date) - new Date(a.date));
  const top = allCommits.slice(0, 10);

  if (top.length === 0) {
    showMessage(commitsContainer, 'Recent commits could not be loaded.');
    return;
  }

  const items = top.map(commit => {
    const item = document.createElement('div');
    item.className = 'commit-item';

    const message = document.createElement('div');
    message.className = 'commit-msg';
    message.title = commit.msg;
    message.textContent = commit.msg;
    item.append(message);

    const meta = document.createElement('div');
    meta.className = 'commit-meta';
    const date = new Date(commit.date);
    const dateText = Number.isNaN(date.getTime()) ? '' : ` · ${date.toLocaleDateString()}`;
    meta.textContent = `${commit.repo} · ${commit.sha}${dateText}`;
    item.append(meta);
    return item;
  });
  commitsContainer.replaceChildren(...items);
}

// --- Projects Page: Menu + README Viewer ---
async function loadReadme(index) {
  const r = repos[index];
  const readmeViewer = document.getElementById('readme-viewer');
  if (!readmeViewer || !r) return;

  readmeViewer.dataset.index = String(index);
  readmeViewer.innerHTML = '<div class="readme-placeholder">Loading…</div>';

  try {
    const res = await fetch(`https://api.github.com/repos/${r.owner.login}/${r.name}/readme`);
    if (readmeViewer.dataset.index !== String(index)) return;
    if (res.status === 404) {
      showMessage(readmeViewer, `No README found for ${r.name}.`);
      return;
    }
    if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
    const data = await res.json();
    if (readmeViewer.dataset.index !== String(index)) return;

    const bytes = Uint8Array.from(atob(data.content), char => char.charCodeAt(0));
    const raw = new TextDecoder('utf-8').decode(bytes);
    readmeViewer.innerHTML = marked.parse(raw);

    readmeViewer.querySelectorAll('a[href], img[src], source[src]').forEach(element => {
      const attribute = element.hasAttribute('href') ? 'href' : 'src';
      const url = element.getAttribute(attribute);
      if (!url || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url)) return;

      const baseUrl = attribute === 'href' ? data.html_url : data.download_url;
      if (baseUrl) element.setAttribute(attribute, new URL(url, baseUrl).href);
    });
  } catch (err) {
    console.error(`Failed to load README for ${r.name}:`, err);
    if (readmeViewer.dataset.index === String(index)) {
      showMessage(readmeViewer, `Could not load the README for ${r.name}. Please try again later.`);
    }
  }
}

function renderProjectMenu(projectMenu) {
  if (repos.length === 0) {
    showMessage(projectMenu, 'No projects are available right now.');
    return;
  }

  const heading = document.createElement('h3');
  heading.textContent = 'Projects';
  const links = repos.map((repo, index) => {
    const link = document.createElement('a');
    link.href = '#readme-viewer';
    link.dataset.index = String(index);
    link.className = index === 0 ? 'active' : '';
    link.textContent = repo.name;
    return link;
  });

  projectMenu.replaceChildren(heading, ...links);
  projectMenu.addEventListener('click', event => {
    const link = event.target.closest('a[data-index]');
    if (!link || !projectMenu.contains(link)) return;
    event.preventDefault();

    projectMenu.querySelectorAll('a[data-index]').forEach(item => item.classList.remove('active'));
    link.classList.add('active');
    loadReadme(Number(link.dataset.index));
  });

  loadReadme(0);
}

// --- Init ---
loadRepos();   

// --- Work and Education Disclosures ---
document.querySelectorAll('.work-item-header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.parentElement;
    if (item.classList.contains('open')) {
      item.classList.remove('open');
      item.classList.add('closed');
    } else {
      item.classList.remove('closed');
      item.classList.add('open');
    }
  });
});

// --- Typing Animation ---
const roles = ['Data Analyst', 'Software Developer', 'Software Designer','Game Enthusiast', 'Software Engineer'];
const typingEl = document.getElementById('typing');
let roleIndex = 0, charIndex = 0, deleting = false;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function type() {
  const current = roles[roleIndex];

  if (deleting) {
    typingEl.textContent = current.slice(0, --charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  } else {
    typingEl.textContent = current.slice(0, ++charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(type, 2000); // pause at full word
      return;
    }
  }

  setTimeout(type, deleting ? 50 : 100);
}

if (typingEl) {
  if (prefersReducedMotion) {
    typingEl.textContent = roles[0];
  } else {
    type();
  }
}

// --- Floating Particles ---
const canvas = document.getElementById('bg-particles');
if (canvas && !prefersReducedMotion) {
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.floor(window.innerWidth / 80);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const color = isLight ? '45, 106, 79' : '45, 212, 168';

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, ${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
}   

// --- Scramble Decode ---
const nameEl = document.querySelector('header h1');
if (nameEl) {
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  const original = nameEl.textContent;
  let frame = 0;

  function scramble() {
    if (frame >= original.length * 3) {
      nameEl.textContent = original;
      return;
    }
    nameEl.textContent = original.split('').map((ch, i) => {
      if (ch === ' ') return ' ';
      if (i < frame / 3) return ch;
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    frame++;
    requestAnimationFrame(scramble);
  }

  // Start after a short delay so the page feels intentional
  setTimeout(scramble, 300);
}   