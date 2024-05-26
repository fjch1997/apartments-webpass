let work = 0;

async function getStatus(url: string) {
    const cachedResult = localStorage.getItem(url);
    if (cachedResult !== null) {
        return parseInt(cachedResult);
    }
    const status = await chrome.runtime.sendMessage({ method: "fetchStatus", url } as Message);
    if (typeof status === "number" && (status === 200 || status === 304)) {
        localStorage.setItem(url, status.toString());
    }

    return status;
}

async function checkWebpass(element: HTMLElement, splitAddress: string[]) {
    work++;
    try {
        element.innerText = "⌛ " + element.innerText;
        const zip = splitAddress[2].substring(3, 8);
        const status = await getStatus(`https://gfiber.com/webpass/signup/?address1=${splitAddress[0]}&ref=homepage&unit=&zip=${zip}`);
        if (status === 200) {
            element.innerText = "✔️" + element.innerText.substring(1);
            localStorage.setItem(splitAddress[0], "200");
        } else if (status === 304) {
            element.innerText = "❌" + element.innerText.substring(1);
            localStorage.setItem(splitAddress[0], "304");
        } else {
            element.innerText = "❔" + element.innerText.substring(1);
        }
    }
    catch {
        element.innerText = "❔" + element.innerText.substring(1);
    }
    finally {
        work--;
    }
}

function getListings() {
    return [
        ...document.getElementsByClassName("property-title js-placardTitle"),
        ...document.getElementsByClassName("property-address js-url"),
        ...document.getElementsByClassName("js-placardTitle title"),
    ]
}

setInterval(() => {
    for (const listing of getListings()) {
        if (!(listing instanceof HTMLElement))
            continue;
        if (listing.innerText.startsWith("✔️") || listing.innerText.startsWith("⌛") || listing.innerText.startsWith("❌") || listing.innerText.startsWith("❔"))
            continue;
        if (work > 5)
            return;
        const splitAddress = listing.innerText.split(", ");
        if (splitAddress.length !== 3)
            continue;
        checkWebpass(listing, splitAddress);
    }
}, 100);
