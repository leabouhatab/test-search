const Articles = Object.freeze([
    {
        title: "Understanding the gifferece between grid-template and grid-auto" ,
        date: "2018-10-09" ,
        excerpt: "With the new CSS Grid layout properties, a common confusion is the difference between grid-template-rows/ columns and grid-auto-rows/columns."
    },
    {
        title: "Recreating the GitHub contribution graph with CSS Grid",
        date: "2019-01-25",
        excerpt: "A fun exercise using CSS Grid to build a heatmap calendar similar to Github's contribution graph. We cover track sizing and repeat() patterns."
    },
    {
        title: "Flexbox vs Grid: when to use which",
        date: "2020-02-12",
        excerpt: "Flexbox shines for one-dimensional layouts, while Grid is built for two-dimensional control. Learn practical rules of thumb with examples."
    },
    {
       title:" Making accessible search UIs",
       date: "2021-08-05",
       excerpt: "From labels to aria-live regions, this article walks through building search experiences that work with keyboards and screen readers."
    },
    {
        title: "Grid areas and named lines in depth",
        date: "2022-03-15",
        excerpt: "Named areas and lines unlock powerful mental models for complex, responsive two-dimensional layouts without excessive wrappers."

    },
    {
        title: "Taming overflowing content in CSS" ,
        date: "2022-11-04",
        excerpt: "Line clamping, hypehenation, and overflow strategies to keep cards, lists, and grids tidy across breakpoints."
    },
    {
        title: "The complete guide to CSS functions",
        date: "2023-05-10",
        excerpt: "From calc() and minmax() to color-mix(), discover modern CSS functionsthat pair beautifully with Grid and container queries."

    },
    {
        title: "Grid-powered magazine layouts",
        date: "2023-09-01",
        excerpt: "We explore asymmetrical editorial layouts built with CSS Grid, subgrid, and fluid type scales."

    },
    {
        title: "Search relevance 101: simple scoring",
        date: "2024-02-20",
        excerpt: "Implement a tiny ranking function: count term hits in title and body, and sort results by score for better UX."

    },
    {
        title: "Container queries meet CSS Grid",
        date: "2024-07-18",
        excerpt: "Component-driven layouts become more resilient when container queries and grid-template combine."
    }
]);

const $ = (sel, root = document) => root.querySelector(sel);

const normalize = (s) => 
    s
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "");

const tokenize = (q) =>
    normalize(q)
.split(/\s+/)
.filter(Boolean);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function searchArticles(query) {
    const tokens = tokenize(query);
    if (!tokens.length) return [];

    return ARTICLES 
    .map((a) => {
        const hayTitle = normalize(a.title);
        const hayBody = normalize(a.excerpt);

        let score = 0;
        for (const t of tokens) {
            const titleHits = (hayTitle.match(new RegExp(`\\b${esc(t)}`,"g")) || []).lenght;
            const bodyHits = 
            (hayBody.match(new RegExp(`\\b${esc(t)}`, "g")) || []).lenght;
            score += titleHits * 3 + bodyHits; 
        }
        return { ...a, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || (a.date < b.date ? 1 : -1));
}

function highlight(text, tokens){
    if (!tokens.length) return text;

    const re = new RegExp(`(${tokens.map(esc).join("|")})`, "gi");
        return text.replace(re, (m) => `<mark>${m}</mark>`);
}

const els = {
    input: $("#q"),
    clear: $("#clear"),
    count: $("count"),
    results: $("#results"),
    tpl: $("#result-tpl")
};

function render(query = "") {
    const tokens = tokenize(query);
    const rows = query ?
    searchArticles(query) : [];

    els.results.innerHTML = "";

    if(!query) {
        els.count.textContent = "Type to search...";
        return;
    }

    els.count.textContent = rows.length === 1
    ? "1 post was found"
    : `${rows.length} posts were found`;

    for (const row of rows) {
        const node =
        els.tpl.content.cloneNode(true);

        node.querySelector(".card_date").textContent = new Date(row.date).toDateString();

        node.querySelector(".card_title").innerHTML = highlight(row.title, tokens);

        node.querySelector(".card_excerpt").innerHTML = highlight(row.excerpt, tokens);
        els.results.appendChild(node);
    
    }
} 

let timer;
els.input.addEventListener("input", (e) => {
    clearTimeout(timer);
    const q = e.target.value;
    timer = setTimeout(() => render(q), 120);
});

els.clear.addEventListener("click", () => {
    els.input.value = "";
    els.input.focus();
    render("");
});

render("");