const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../../database/economy.json");
const START = 100;
let db = {};
let dirty = false;
try { db = JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { db = {}; }

function save() {
    if (!dirty) return;
    try {
        fs.mkdirSync(path.dirname(FILE), { recursive: true });
        fs.writeFileSync(FILE, JSON.stringify(db));
        dirty = false;
    } catch {}
}
setInterval(save, 10000).unref();
process.on("exit", save);

function user(uid, name) {
    const u = (db[uid] ||= { coins: START, lastWork: 0, name: "" });
    if (name) u.name = name;
    dirty = true;
    return u;
}

const get = (uid, name) => user(uid, name);
const add = (uid, n) => { const u = user(uid); u.coins = Math.max(0, u.coins + n); return u.coins; };
const richest = (n = 10) => Object.entries(db).sort((a, b) => b[1].coins - a[1].coins).slice(0, n)
    .map(([uid, u]) => ({ uid, ...u }));

module.exports = { get, add, richest, user };
