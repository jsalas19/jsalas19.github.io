
const repos = [
{ id: 'stats-1', owner: 'jsalas19', repo: 'EthicalProject-again-2' },
{ id: 'stats-2', owner: 'jsalas19', repo: 'CS4375' },
];

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
