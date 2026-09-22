function injectTopLeftBadge(scoreText, statusClass) {
  let badge = document.getElementById("dark-pattern-overlay-badge");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "dark-pattern-overlay-badge";
    
    // Safely append to body or fallback to documentElement
    if (document.body) {
      document.body.appendChild(badge);
    } else {
      document.documentElement.appendChild(badge);
    }
  }
  
  badge.className = statusClass;
  badge.innerHTML = `
    <div class="score-dot"></div>
    <div class="score-text">${scoreText}</div>
  `;
}

// Initial badge render on load
function initBadge() {
  injectTopLeftBadge("🛡️ DarkPattern AI Ready", "score-safe");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBadge);
} else {
  initBadge();
}

// Message Listener for Popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_PAGE_DATA") {
    sendResponse({
      url: window.location.href,
      domText: document.body ? document.body.innerText.substring(0, 1500) : ""
    });
  } else if (request.action === "UPDATE_OVERLAY_SCORE") {
    // Format score or fall back to default label
    const formattedScore = request.score || "Scan Complete";
    const appliedClass = request.statusClass || "score-safe";
    
    injectTopLeftBadge(formattedScore, appliedClass);
    sendResponse({ status: "updated" });
  }
  return true;
});