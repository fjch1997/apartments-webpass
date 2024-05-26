chrome.runtime.onMessage.addListener(
    function (request: Message, sender, sendResponse) {
        if (request.method === "fetchStatus") {
            fetch(request.url, { redirect: "manual", mode: "no-cors" })
                .then(response => response.type === "opaqueredirect" ? sendResponse(304) : sendResponse(response.status))
                .catch(() => sendResponse(0));
            return true;
        }
        return false;
    });
