let popularLinks = [
    "https://www.youtube.com/watch?v=EeB-sl07hdY",
    "https://www.youtube.com/watch?v=kbLDxLdm0w8",
    "https://www.youtube.com/watch?v=zjCvE5hV6jY",
    "https://www.youtube.com/watch?v=QRMShFqP-rA",
    "https://www.youtube.com/watch?v=I-sxAypEFpU",
    "https://www.youtube.com/watch?v=Ka5VDnkyxGc",
    "https://www.youtube.com/watch?v=tKwt6Uhz9nw",
    "https://www.youtube.com/watch?v=AJqs61evqrQ",
    "https://www.youtube.com/watch?v=8FzigI-Ny8I",
    "https://www.youtube.com/watch?v=ckKB_WyjUNc",
    "https://www.youtube.com/watch?v=g8Mvwb6mzDg",
    "https://www.youtube.com/watch?v=85xo4YMIdcU",
    "https://www.youtube.com/watch?v=qYEUEjaHfUM",
    "https://www.youtube.com/watch?v=2caMSG24Ruo&pp=0gcJCSQMAYcqIYzv",
    "https://www.youtube.com/watch?v=m8u_PlyM4kk&",
    "https://www.youtube.com/watch?v=g0f2b2z1v3U",
    "https://www.youtube.com/watch?v=JF9myRPmJrA",
    "https://www.youtube.com/watch?v=yp5Q9jWPO-c&t=43s&pp=0gcJCSQMAYcqIYzv",
    "https://www.youtube.com/watch?v=UqWCMZuqd_c",
    "https://www.youtube.com/watch?v=kacUL20JKPE",
    "https://www.youtube.com/watch?v=bcfwKn6alRI",
    "https://www.youtube.com/watch?v=poQIuM2amXI",
    "https://www.youtube.com/watch?v=xV4Eaf3MPN8",
    "https://www.youtube.com/watch?v=bq_Piy6tm0Y",
    "https://www.youtube.com/watch?v=G_PWcRzesPw&pp=0gcJCSQMAYcqIYzv",
    "https://www.youtube.com/watch?v=n05MrO_Rki0",
    "https://www.youtube.com/watch?v=MJmD1ZMJJ9c",
    "https://www.youtube.com/watch?v=jgNH9M2vLGQ",
    "https://www.youtube.com/watch?v=bU6JsAOzHUw",
    "https://www.youtube.com/watch?v=DiHaFUUr5L8"
];


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

const observer = new MutationObserver(() => {

    const grid = document.querySelector("ytd-rich-grid-renderer");
    const titleContainer = grid?.querySelector("#title-container");
    const template = [...(grid?.querySelectorAll("yt-lockup-view-model") ?? [])]
    .find(card =>
        card.querySelector('a[href^="/watch"]') &&
        card.querySelector("yt-thumbnail-view-model img")?.src.includes("ytimg.com") &&
        !card.closest("ytd-ad-slot-renderer, ytd-in-feed-ad-layout-renderer")
    );

    if (template && grid && videoData && titleContainer && !grid.querySelector(".mudja-container")) {

        const container = document.createElement("div");
        container.classList.add("mudja-container");

        videoData.forEach(item => {

            const card = template.cloneNode(true);
            card.querySelectorAll('a[href^="/watch"]').forEach(a => {
                a.href = `/watch?v=${item.id}`;
            });

            const img = card.querySelector("yt-thumbnail-view-model img");
            if (img) {
                img.removeAttribute("srcset");
                img.src = `https://i.ytimg.com/vi/${item.id}/hq720.jpg`;
            
            const title = card.querySelector(".yt-lockup-metadata-view-model__title");
            if (title) title.textContent = item.snippet.title;

            const rows = card.querySelectorAll(".yt-content-metadata-view-model__metadata-row");
            if (rows[0]) rows[0].textContent = item.snippet.channelTitle;
            if (rows[1]) {
                const views = Number(item.statistics.viewCount).toLocaleString("sr");
                const date = new Date(item.snippet.publishedAt).toLocaleDateString("sr");
                rows[1].textContent = `${views} pregleda • ${date}`;
            }
}
            container.appendChild(card);
        });

        grid.insertBefore(container, titleContainer);
    }
});

