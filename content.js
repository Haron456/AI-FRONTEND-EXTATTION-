console.log("Content Script Loaded ✔");

function openSidebar(text = "Scanning...") {
    let panel = document.getElementById("aiScanPanel");

    if (!panel) {
        panel = document.createElement("div");
        panel.id = "aiScanPanel";

        Object.assign(panel.style, {
            position: "fixed",
            top: "0",
            right: "-380px",
            width: "380px",
            height: "100vh",
            background: "#ffffff",
            color: "#000",
            borderLeft: "1px solid #ccc",
            padding: "20px",
            zIndex: "999999999",
            transition: "right 0.25s ease",
            overflowY: "auto",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)"
        });

        const closeBtn = document.createElement("span");
        closeBtn.innerHTML = "&times;";
        Object.assign(closeBtn.style, {
            position: "absolute",
            top: "10px",
            right: "15px",
            fontSize: "28px",
            cursor: "pointer",
            color: "#444"
        });

        closeBtn.onclick = () => panel.remove();
        panel.appendChild(closeBtn);

        const content = document.createElement("div");
        content.id = "aiScanPanelContent";
        content.style.marginTop = "40px";
        content.innerHTML = text;

        panel.appendChild(content);
        document.body.appendChild(panel);
    }

    setTimeout(() => {
        panel.style.right = "0";
    }, 100);

    document.getElementById("aiScanPanelContent").innerHTML = text;
}

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "scanCurrent") {
        openSidebar("Scanning current page...");
    }

    if (msg.type === "scanURL") {
        openSidebar(`Scanning URL: <br><b>${msg.url}</b>`);
    }
});
