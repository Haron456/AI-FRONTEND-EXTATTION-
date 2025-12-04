console.log("popup.js loaded! 🚀");

// -------------------------
// Backend endpoint
// -------------------------
const backendScan = "http://127.0.0.1:8000/scan-url";
const backendPing = "http://127.0.0.1:8000/";

// -------------------------
let backendDetected = false;

// -------------------------
// Elements
// -------------------------
const resultDiv = document.getElementById("result");
const urlInput = document.getElementById("urlInput");
const threatMeter = document.getElementById("threatMeter");
const scanPageBtn = document.getElementById("scanPageBtn");
const scanUrlBtn = document.getElementById("scanUrlBtn");

// -------------------------
// Backend detection
// -------------------------
async function detectBackend() {
    try {
        const res = await fetch(backendPing, { method: "GET" });
        if (!res.ok) throw new Error("Bad response");

        backendDetected = true;
        resultDiv.innerHTML = `<span style="color:green;">ONLINE</span>`;
        return true;

    } catch (e) {
        backendDetected = false;
        resultDiv.innerHTML = `<span style="color:red;">OFFLINE</span>`;
        return false;
    }
}

// Run detection on popup load
detectBackend();

// -------------------------
// Scanning Animation
// -------------------------
function startScanningAnimation() {
    resultDiv.innerHTML = `<div class="loader">Scanning<span class="dots">.</span></div>`;
    let dots = resultDiv.querySelector(".dots");
    let count = 1;
    const interval = setInterval(() => {
        count = (count % 3) + 1;
        dots.textContent = ".".repeat(count);
    }, 400);
    return interval;
}

// -------------------------
// Scan current page
// -------------------------
scanPageBtn.addEventListener("click", async () => {
    if (!backendDetected) await detectBackend();
    if (!backendDetected) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0] || !tabs[0].url) {
            resultDiv.innerHTML = `<span style="color:red;">Cannot read current page URL.</span>`;
            return;
        }
        analyzeURL(tabs[0].url);
    });
});

// -------------------------
// Scan URL input
// -------------------------
scanUrlBtn.addEventListener("click", async () => {
    if (!backendDetected) await detectBackend();
    if (!backendDetected) return;

    const url = urlInput.value.trim();
    if (!url) {
        resultDiv.innerHTML = `<span style="color:red;">Enter a URL first.</span>`;
        return;
    }
    analyzeURL(url);
});

// -------------------------
// Analyze URL
// -------------------------
async function analyzeURL(url) {
    const interval = startScanningAnimation();
    if (!url.startsWith("http")) url = "http://" + url;

    try {
        const res = await fetch(backendScan, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });

        clearInterval(interval);

        if (!res.ok) throw new Error("Backend error");

        const data = await res.json();
        displayResults(data);

    } catch (err) {
        clearInterval(interval);
        resultDiv.innerHTML = `<span style="color:red;">Scan failed ❌. Backend error.</span>`;
        threatMeter.style.width = "0%";
    }
}

// -------------------------
// Show results
// -------------------------
function displayResults(data) {
    const riskColors = { high: "#ff4d4d", medium: "#ffcc33", low: "#00ff99" };
    const riskColor = riskColors[data.risk] || "#00ff99";

    threatMeter.style.background = riskColor;
    threatMeter.style.width = `${(data.score || 0) * 100}%`;

    const preview = (data.preview || "").replace(/</g, "&lt;").replace(/>/g, "&gt;/");

    const aiSummary = data.summary_text || data.summary || "No summary available";

    resultDiv.innerHTML = `
        <b>URL:</b> ${data.url}<br>
        <b>Risk:</b> 
        <span style="color:${riskColor}; font-weight:700">${data.risk}</span><br>

        <b>Score:</b> ${(data.score * 100).toFixed(1)}%<br><br>

        <b>Threats:</b>
        <ul>${(data.categories || []).map(t => `<li>${t}</li>`).join("")}</ul>

        <b>AI Summary:</b><br>
        ${aiSummary}<br><br>

        <b>Preview:</b><br>
        <small>${preview}</small>
    `;
}

// ---------------------------------------------------------
// ⭐ NEW FEATURE — Open Full Web Analyzer Page
// ---------------------------------------------------------
document.getElementById("openAnalyzerBtn").addEventListener("click", () => {
    chrome.tabs.create({
        url: "file:///home/haron/AI-analizer%20page/page.html"
    });
});
