console.log("🕵️ Sales Hunter AI Active on LinkedIn");

// Simple scraper for Item 16
function scrapeProfile() {
    const name = document.querySelector('.text-heading-xlarge')?.innerText;
    const role = document.querySelector('.text-body-medium')?.innerText;

    if(name && role) {
        // Send to App (Simulated via console or message passing)
        console.log(`[Hunter] Found: ${name} - ${role}`);
        // chrome.runtime.sendMessage({ action: "saveLead", data: { name, role } });
    }
}

// Observer to handle SPA navigation
const observer = new MutationObserver(() => {
    if(window.location.href.includes('/in/')) {
        scrapeProfile();
    }
});

observer.observe(document.body, { childList: true, subtree: true });
