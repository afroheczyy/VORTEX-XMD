const config = require("../../config/config");

const DIV = "──────────────────";

function footer() {
    return `\n\n${DIV}\n_🌀 VORTEX XMD · ${config.branding.footer}_`;
}

function header(title) {
    return `*${config.branding.emoji} ${title}*\n${DIV}`;
}

function modernize(text) {
    const src = String(text);
    if (!/[╭╰┃┣┏┗]/.test(src)) return src;

    const out = [];
    let titled = false;

    for (const raw of src.split("\n")) {
        const t = raw.trim();
        const title = t.match(/^[╭┏┣].*?〔\s*(.+?)\s*〕/);

        if (title) {
            if (t.startsWith("┣")) {
                out.push("", `*▸ ${title[1]}*`);
            } else {
                out.push(`*${title[1]}*`, DIV);
                titled = true;
            }
            continue;
        }
        if (/^[╭┏][━─═]+[╮┓]$/.test(t)) continue;
        if (/^[╰┗][━─═]+[╯┛]$/.test(t)) {
            out.push(titled ? DIV : "");
            titled = false;
            continue;
        }
        if (/^[┃│]/.test(t)) {
            out.push(t.replace(/^[┃│]\s*/, "").replace(/\s*[┃│]$/, ""));
            continue;
        }
        out.push(raw);
    }

    return out.join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(new RegExp(`${DIV}\\n\\n`, "g"), `${DIV}\n`)
        .replace(new RegExp(`\\n\\n${DIV}`, "g"), `\n${DIV}`)
        .trim();
}

function box(title, body) {
    return [header(title), ...String(body).split("\n"), DIV].join("\n") + footer();
}

function commandResponse(text) {
    const clean = modernize(text);
    const f = config.branding.footer || "";
    if (f && clean.includes(f)) return clean;
    return clean + footer();
}

module.exports = { footer, header, box, commandResponse };
