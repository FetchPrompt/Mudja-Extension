
popularLinks.sort(() => Math.random() - 0.5);

const selected = popularLinks.slice(0, 4);

const ids = selected.map(link => new URL(link).searchParams.get("v"));

async function getVideoData(){
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${ids.join(",")}&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.items;
}

let videoData = null;
getVideoData().then(items => {
    videoData = items;
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})

const avatarUrl = chrome.runtime.getURL("profilna.jpg");
const walkerUrl = chrome.runtime.getURL("walker.png");
const verifiedIcon = `<svg class="mudja-verified" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
const playIcon = `<svg class="mudja-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;

function addWalker() {
    if (document.querySelector(".mudja-track")) return;

    const track = document.createElement("div");
    track.classList.add("mudja-track");

    const walker = document.createElement("div");
    walker.classList.add("mudja-walker");
    walker.innerHTML = `<img src="${walkerUrl}">`;

    track.appendChild(walker);
    document.body.appendChild(track);
}

addWalker();

function formatViews(n) {
    n = Number(n);
    if (n >= 1000000) {
        return (n / 1000000).toFixed(1).replace(".", ",").replace(",0", "") + " мил.";
    }
    if (n >= 1000) {
        return Math.floor(n / 1000) + " хиљ.";
    }
    return String(n);
}

function formatAge(dateString) {
    const days = Math.floor((Date.now() - new Date(dateString)) / 86400000);
    if (days >= 365) return `пре ${Math.floor(days / 365)} год.`;
    if (days >= 30) return `пре ${Math.floor(days / 30)} мес.`;
    return `пре ${days} дан.`;
}

const observer = new MutationObserver(() => {

    const grid = document.querySelector("ytd-rich-grid-renderer");
    const titleContainer = grid?.querySelector("#title-container");

    if (grid && videoData && titleContainer && !grid.querySelector(".mudja-container")) {

        const container = document.createElement("div");
        container.classList.add("mudja-container");

        videoData.forEach(item => {
            const card = document.createElement("div");
            card.classList.add("mudja-card");

            card.innerHTML = `
                <a class="mudja-thumbnail-link" href="/watch?v=${item.id}">
                    <img class="mudja-thumbnail" src="https://i.ytimg.com/vi/${item.id}/hq720.jpg">
                </a>
                <div class="mudja-row">
                    <img class="mudja-avatar" src="${avatarUrl}">
                    <div class="mudja-info">
                        <a class="mudja-title" href="/watch?v=${item.id}">${item.snippet.title}</a>
                        <div class="mudja-channel">
                            <a class="mudja-channel-link" href="/@Mudja">${item.snippet.channelTitle}</a>
                            ${verifiedIcon}
                        </div>
                        <div class="mudja-stats">${playIcon}${formatViews(item.statistics.viewCount)} прегледа • ${formatAge(item.snippet.publishedAt)}</div>
                    </div>
                </div>
            `;

    container.appendChild(card);
});


        grid.insertBefore(container, titleContainer);
    }
});

