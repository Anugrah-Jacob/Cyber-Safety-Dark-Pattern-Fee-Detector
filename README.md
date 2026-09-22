# 🛡️ DarkPattern AI — Cyber-Safety & Hidden Fee Detector

An AI-powered browser extension and community reporting portal designed to expose deceptive web layouts, hidden recurring fees, and manipulative e-commerce checkout flows.

---

## 📌 Problem Statement

E-commerce sites and subscription services frequently trick users into paying extra by using deceptive UI designs, sneaky pre-checked boxes, forced continuity, and hidden recurring fees.

### The Challenge
Build a consumer safety platform where users can:
1. **Detect** dark patterns in real-time on any webpage using Gemini AI.
2. **Submit** consumer reports with deceptive site links and context.
3. **Browse & Vote** on a community-maintained index of unethical web layouts.

---

## 🏗️ Architecture & Features

* **Chrome Extension (Manifest V3):**
  * **Overlay Badge:** Live badge injected onto active webpages indicating safety score.
  * **AI Scanner:** Extracts visible DOM context and queries the backend for pattern recognition.
  * **Reporting Tab:** Easy target submission form for users to flag unethical checkouts.
  * **Community Index:** Live listing of user-flagged sites with community voting (Upvote/Downvote).
* **FastAPI Backend:**
  * Asynchronous REST API managing page analysis, report logging, and community voting data.
  * CORS middleware enabled for seamless browser extension integration.

---

## 📁 Repository Structure

```text
├── manifest.json       # Chrome Extension Manifest V3 configuration
├── content.js          # Injected script for DOM text extraction & badge UI
├── overlay.css         # Styling for the webpage floating badge
├── popup.html          # Extension popup UI (Detector, Report, Community Index)
├── popup.js            # Frontend application logic & API fetch layer
└── main.py             # FastAPI backend server