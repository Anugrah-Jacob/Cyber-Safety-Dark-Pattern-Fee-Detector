const BACKEND_URL = "https://upgraded-halibut-7qx97967w6j3pp7p-8000.app.github.dev/"; // Fallback local backend or active production endpoint

document.addEventListener("DOMContentLoaded", () => {
  // Navigation Tabs Logic
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");

      if (tab.dataset.tab === "tab-index") {
        loadCommunityIndex();
      }
    });
  });

  // Tab 1: AI Scanner
  const scanBtn = document.getElementById("scanBtn");
  const statusDiv = document.getElementById("status");
  const resultsDiv = document.getElementById("results");

  scanBtn.addEventListener("click", async () => {
    statusDiv.innerText = "Scanning page...";
    resultsDiv.innerHTML = "";

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.url.startsWith("http")) {
      statusDiv.innerText = "Cannot scan restricted or system tab.";
      return;
    }

    // Auto fill report tab with current tab URL
    document.getElementById("reportUrl").value = tab.url;

    chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_PAGE_DATA" }, async (response) => {
      if (chrome.runtime.lastError || !response) {
        statusDiv.innerText = "Please refresh the page and try again.";
        return;
      }

      try {
        const apiRes = await fetch(`${BACKEND_URL}/api/v1/scan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: response.url, dom_text: response.domText })
        });

        const result = await apiRes.json();
        statusDiv.innerText = "";

        if (result.data) {
          const darkPatternHtml = result.data.is_dark_pattern
            ? `<div class="card card-danger"><strong>🚨 Dark Pattern:</strong> ${result.data.category}<br/>${result.data.explanation}</div>`
            : `<div class="card card-safe"><strong>✅ UI Safety:</strong> No hidden fees or deceptive UI detected.</div>`;

          resultsDiv.innerHTML = darkPatternHtml;
        }
      } catch (e) {
        statusDiv.innerText = "Backend connection failed. Ensure backend server is running.";
      }
    });
  });

  // Tab 2: Submit Consumer Report
  const submitReportBtn = document.getElementById("submitReportBtn");
  const reportStatus = document.getElementById("reportStatus");

  submitReportBtn.addEventListener("click", async () => {
    const url = document.getElementById("reportUrl").value;
    const category = document.getElementById("reportCategory").value;
    const description = document.getElementById("reportDesc").value;

    if (!url) {
      reportStatus.innerText = "URL is required.";
      return;
    }

    reportStatus.innerText = "Submitting report...";

    try {
      const apiRes = await fetch(`${BACKEND_URL}/api/v1/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, category, description })
      });

      if (apiRes.ok) {
        reportStatus.style.color = "#166534";
        reportStatus.innerText = "Report submitted successfully!";
        document.getElementById("reportDesc").value = "";
      } else {
        throw new Error();
      }
    } catch (e) {
      reportStatus.style.color = "#991b1b";
      reportStatus.innerText = "Failed to submit report to server.";
    }
  });

  // Tab 3: Fetch & Vote on Community Submissions
  async function loadCommunityIndex() {
    const listDiv = document.getElementById("communityList");
    listDiv.innerHTML = "Loading...";

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/reports`);
      const reports = await res.json();

      if (!reports || reports.length === 0) {
        listDiv.innerHTML = "<div style='font-size:11px; text-align:center;'>No reports submitted yet.</div>";
        return;
      }

      listDiv.innerHTML = reports.map(r => `
        <div class="community-item">
          <div class="community-title">${r.category}</div>
          <div class="community-meta">${r.url}</div>
          <div style="font-size:11px; margin-top:4px;">${r.description}</div>
          <div class="vote-btns">
            <button class="vote-btn" onclick="vote('${r.id}', 'up')">👍 Confirm (${r.upvotes || 0})</button>
            <button class="vote-btn" onclick="vote('${r.id}', 'down')">👎 False Alarm (${r.downvotes || 0})</button>
          </div>
        </div>
      `).join("");
    } catch (e) {
      listDiv.innerHTML = "<div style='font-size:11px; color:#991b1b;'>Failed to fetch community entries.</div>";
    }
  }
});