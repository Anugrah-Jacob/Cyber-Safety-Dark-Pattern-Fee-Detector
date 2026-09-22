const BACKEND_URL = "YOUR_CODESPACE_URL_HERE"; // <-- Paste your exact GitHub Codespaces URL here (without trailing slash)

document.addEventListener("DOMContentLoaded", () => {
  const scanBtn = document.getElementById("scanBtn");
  const statusDiv = document.getElementById("status");
  const resultsDiv = document.getElementById("results");

  scanBtn.addEventListener("click", async () => {
    statusDiv.innerText = "Extracting page content...";
    resultsDiv.innerHTML = "";

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.id) {
        statusDiv.innerText = "Error: Active tab not found.";
        return;
      }

      chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_PAGE_DATA" }, async (response) => {
        if (chrome.runtime.lastError || !response) {
          statusDiv.innerText = "Please refresh the page and try again.";
          return;
        }

        statusDiv.innerText = "Analyzing page with Gemini AI...";

        try {
          const apiRes = await fetch(`${BACKEND_URL}/api/v1/scan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: response.url,
              dom_text: response.domText
            })
          });

          const result = await apiRes.json();
          statusDiv.innerText = "";

          if (result.data && result.data.is_dark_pattern) {
            resultsDiv.innerHTML = `
              <div class="card-danger">
                <span class="badge">${result.data.severity || 'HIGH'} SEVERITY</span><br/>
                <strong>${result.data.category}</strong><br/><br/>
                ${result.data.explanation}
              </div>`;
          } else {
            resultsDiv.innerHTML = `
              <div class="card-safe">
                <strong>✅ Clean Page</strong><br/>
                No deceptive UI or dark patterns detected on this checkout page.
              </div>`;
          }

        } catch (err) {
          statusDiv.innerText = "Failed to communicate with AI Backend.";
          console.error("Backend error:", err);
        }
      });

    } catch (e) {
      statusDiv.innerText = "Execution failed.";
      console.error(e);
    }
  });
});
