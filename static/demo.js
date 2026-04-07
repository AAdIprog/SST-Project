const sampleList = document.getElementById("sampleList");
const featuredCases = document.getElementById("featuredCases");
const leaderboardStrip = document.getElementById("leaderboardStrip");
const inputText = document.getElementById("inputText");
const taskType = document.getElementById("taskType");
const policyMode = document.getElementById("policyMode");
const contentFormat = document.getElementById("contentFormat");
const agent = document.getElementById("agent");
const compareMode = document.getElementById("compareMode");
const runButton = document.getElementById("runButton");
const clearButton = document.getElementById("clearButton");
const refreshSamples = document.getElementById("refreshSamples");
const statusMessage = document.getElementById("statusMessage");
const beforePane = document.getElementById("beforePane");
const afterPane = document.getElementById("afterPane");
const referencePane = document.getElementById("referencePane");
const resultAction = document.getElementById("resultAction");
const preferredAction = document.getElementById("preferredAction");
const scoreCards = document.getElementById("scoreCards");
const riskList = document.getElementById("riskList");
const adversarialList = document.getElementById("adversarialList");
const failureList = document.getElementById("failureList");
const typesList = document.getElementById("typesList");
const compareSection = document.getElementById("compareSection");
const compareResults = document.getElementById("compareResults");
const openPresentationButton = document.getElementById("openPresentationButton");

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#9c2f2f" : "#6f6359";
}

function renderList(target, items) {
  const values = items && items.length ? items : ["None"];
  target.innerHTML = values.map((item) => `<li>${escapeHtml(String(item))}</li>`).join("");
}

function renderScoreCards(reward) {
  const metrics = [
    ["Score", reward.score],
    ["Progress", reward.progress],
    ["Leak Free", reward.leak_free_ratio],
    ["Utility", reward.utility_ratio],
    ["Format", reward.format_ratio],
    ["Policy", reward.policy_ratio],
    ["Action", reward.action_ratio],
    ["Adversarial", reward.adversarial_ratio],
  ];
  scoreCards.innerHTML = metrics
    .map(
      ([label, value]) => `
        <div class="score-card">
          <span>${escapeHtml(label)}</span>
          <strong>${Number(value).toFixed(3)}</strong>
        </div>
      `
    )
    .join("");
}

function applySample(sample) {
  inputText.value = sample.text;
  taskType.value = sample.task_type;
  policyMode.value = sample.policy_mode;
  contentFormat.value = sample.content_format;
  beforePane.textContent = inputText.value;
  setStatus(`Loaded sample: ${sample.task_name}`);
}

function renderPrimaryRun(run) {
  beforePane.textContent = inputText.value;
  afterPane.textContent = run.output_text;
  referencePane.textContent = run.reference_output;
  resultAction.textContent = run.action_type;
  preferredAction.textContent = `preferred: ${run.preferred_action}`;
  renderScoreCards(run.reward);
  renderList(riskList, run.risk_report);
  renderList(adversarialList, run.adversarial_signals);
  renderList(failureList, run.failure_reasons);
  renderList(typesList, run.detected_sensitive_types);
}

function renderCompare(runs) {
  const order = Object.keys(runs);
  compareResults.innerHTML = order
    .map((name) => {
      const run = runs[name];
      return `
        <article class="compare-card">
          <div class="sample-meta">
            <span class="chip">${escapeHtml(name)}</span>
            <span class="tag">${escapeHtml(run.action_type)}</span>
          </div>
          <h3>Score ${Number(run.reward.score).toFixed(3)}</h3>
          <pre>${escapeHtml(run.output_text)}</pre>
        </article>
      `;
    })
    .join("");
  compareSection.classList.remove("hidden");
}

function clearCompare() {
  compareSection.classList.add("hidden");
  compareResults.innerHTML = "";
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function loadSamples() {
  setStatus("Loading samples...");
  const response = await fetch("/demo/samples");
  const payload = await response.json();
  sampleList.innerHTML = payload.samples
    .map(
      (sample) => `
        <button class="sample-card" type="button"
          data-text="${encodeURIComponent(sample.text)}"
          data-task-type="${sample.task_type}"
          data-policy-mode="${sample.policy_mode}"
          data-content-format="${sample.content_format}">
          <div class="sample-meta">
            <span class="chip">${escapeHtml(sample.task_type)}</span>
            <span class="chip">${escapeHtml(sample.policy_mode)}</span>
            <span class="chip">${escapeHtml(sample.content_format)}</span>
          </div>
          <h3>${escapeHtml(sample.task_name)}</h3>
          <p>${escapeHtml(sample.text.slice(0, 120))}${sample.text.length > 120 ? "..." : ""}</p>
        </button>
      `
    )
    .join("");

  sampleList.querySelectorAll(".sample-card").forEach((button) => {
    button.addEventListener("click", () => {
      applySample({
        text: decodeURIComponent(button.dataset.text),
        task_type: button.dataset.taskType,
        policy_mode: button.dataset.policyMode,
        content_format: button.dataset.contentFormat,
        task_name: button.querySelector("h3").textContent,
      });
    });
  });
  setStatus("Samples ready.");
}

async function loadFeaturedCases() {
  const response = await fetch("/demo/featured");
  const payload = await response.json();
  featuredCases.innerHTML = payload.samples
    .map(
      (sample) => `
        <article class="featured-card">
          <div class="sample-meta">
            <span class="chip">${escapeHtml(sample.task_type)}</span>
            <span class="chip">${escapeHtml(sample.policy_mode)}</span>
          </div>
          <h3>${escapeHtml(sample.task_name)}</h3>
          <p>${escapeHtml(sample.text.slice(0, 170))}${sample.text.length > 170 ? "..." : ""}</p>
          <button class="primary-button featured-load" type="button"
            data-text="${encodeURIComponent(sample.text)}"
            data-task-type="${sample.task_type}"
            data-policy-mode="${sample.policy_mode}"
            data-content-format="${sample.content_format}"
            data-task-name="${escapeHtml(sample.task_name)}">Load This Case</button>
        </article>
      `
    )
    .join("");

  featuredCases.querySelectorAll(".featured-load").forEach((button) => {
    button.addEventListener("click", () => {
      applySample({
        text: decodeURIComponent(button.dataset.text),
        task_type: button.dataset.taskType,
        policy_mode: button.dataset.policyMode,
        content_format: button.dataset.contentFormat,
        task_name: button.dataset.taskName,
      });
      window.scrollTo({ top: document.querySelector(".workspace").offsetTop - 12, behavior: "smooth" });
    });
  });
}

async function loadLeaderboard() {
  const response = await fetch("/demo/leaderboard");
  const payload = await response.json();
  const leaderboard = payload.leaderboard || {};
  leaderboardStrip.innerHTML = Object.entries(leaderboard)
    .map(([name, entry]) => `
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
    `)
    .join("");
}

async function runDemo() {
  if (!inputText.value.trim()) {
    setStatus("Paste a document or choose a sample first.", true);
    return;
  }

  setStatus("Running sanitization...");
  runButton.disabled = true;

  const payload = {
    text: inputText.value,
    task_type: taskType.value,
    policy_mode: policyMode.value,
    content_format: contentFormat.value,
    agent: agent.value,
  };

  try {
    if (compareMode.checked) {
      const compareResponse = await fetch("/demo/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          agents: ["random", "rules", agent.value].filter((value, index, array) => array.indexOf(value) === index),
        }),
      });
      const comparePayload = await compareResponse.json();
      if (!compareResponse.ok) {
        throw new Error(comparePayload.detail || "Comparison failed");
      }

      const primaryRun = comparePayload.runs[agent.value] || comparePayload.runs.rules || Object.values(comparePayload.runs)[0];
      renderPrimaryRun(primaryRun);
      renderCompare(comparePayload.runs);
      setStatus("Comparison complete.");
      return;
    }

    clearCompare();
    const response = await fetch("/demo/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const run = await response.json();
    if (!response.ok) {
      throw new Error(run.detail || "Run failed");
    }
    renderPrimaryRun(run);
    setStatus("Sanitization complete.");
  } catch (error) {
    setStatus(error.message || "Request failed.", true);
  } finally {
    runButton.disabled = false;
  }
}

runButton.addEventListener("click", runDemo);
clearButton.addEventListener("click", () => {
  inputText.value = "";
  beforePane.textContent = "";
  afterPane.textContent = "";
  referencePane.textContent = "";
  resultAction.textContent = "idle";
  preferredAction.textContent = "preferred: n/a";
  scoreCards.innerHTML = "";
  renderList(riskList, []);
  renderList(adversarialList, []);
  renderList(failureList, []);
  renderList(typesList, []);
  clearCompare();
  setStatus("Cleared.");
});
refreshSamples.addEventListener("click", loadSamples);
openPresentationButton.addEventListener("click", () => {
  window.open("/judge", "_blank", "noopener");
});
compareMode.addEventListener("change", () => {
  if (!compareMode.checked) {
    clearCompare();
  }
});

Promise.all([loadSamples(), loadFeaturedCases(), loadLeaderboard()]).catch((error) =>
  setStatus(error.message || "Failed to load demo assets.", true)
);
