function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function loadLandingData() {
  const [featuredResponse, leaderboardResponse] = await Promise.all([
    fetch("/demo/featured"),
    fetch("/demo/leaderboard"),
  ]);

  const featuredPayload = await featuredResponse.json();
  const leaderboardPayload = await leaderboardResponse.json();

  const featured = document.getElementById("landingFeatured");
  featured.innerHTML = featuredPayload.samples
    .map(
      (sample) => `
        <article class="featured-card">
          <div class="sample-meta">
            <span class="chip">${escapeHtml(sample.task_type)}</span>
            <span class="chip">${escapeHtml(sample.policy_mode)}</span>
          </div>
          <h3>${escapeHtml(sample.task_name)}</h3>
          <p>${escapeHtml(sample.text.slice(0, 170))}${sample.text.length > 170 ? "..." : ""}</p>
          <a class="primary-button action-link" href="/demo">Open In Playground</a>
        </article>
      `
    )
    .join("");

  const leaderboard = document.getElementById("landingLeaderboard");
  leaderboard.innerHTML = Object.entries(leaderboardPayload.leaderboard || {})
    .map(
      ([name, entry]) => `
        <article class="leaderboard-card">
          <div class="sample-meta">
            <span class="chip">${escapeHtml(name)}</span>
          </div>
          <h3>Overall ${Number(entry.overall).toFixed(3)}</h3>
          <div class="leaderboard-stats">
            <div><span>Easy</span><strong>${Number(entry.task_averages.easy || 0).toFixed(3)}</strong></div>
            <div><span>Medium</span><strong>${Number(entry.task_averages.medium || 0).toFixed(3)}</strong></div>
            <div><span>Hard</span><strong>${Number(entry.task_averages.hard || 0).toFixed(3)}</strong></div>
            <div><span>Failures</span><strong>${Object.keys(entry.failure_counts || {}).length}</strong></div>
          </div>
        </article>
      `
    )
    .join("");
}

loadLandingData().catch((error) => {
  console.error(error);
});
