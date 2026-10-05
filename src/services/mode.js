const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "../../database/mode.json");

function get() {
    try { return JSON.parse(fs.readFileSync(FILE, "utf8")).mode === "private" ? "private" : "public"; }
    catch { return "public"; }
}
function set(m) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify({ mode: m === "private" ? "private" : "public" }));
}
function blocked(context) {
    return get() === "private" && !context.isOwner;
}

module.exports = { get, set, blocked };
