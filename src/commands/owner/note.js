const fs = require("fs");
const path = require("path");
const { commandResponse } = require("../../utils/branding");
const FILE = path.join(__dirname, "../../../database/notes.json");

const load = () => { try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return {}; } };
const save = d => { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(d)); };

module.exports = {
    name: "note", aliases: ["notes"], category: "owner",
    permission: "owner", description: "Save and read your own notes.",
    usage: ".note add title | text   .note get title   .note list   .note del title",
    async execute(context) {
        const [sub, ...rest] = context.args || [];
        const s = (sub || "list").toLowerCase();
        const db = load();
        const raw = rest.join(" ").trim();

        if (s === "add") {
            const [t, ...b] = raw.split("|");
            const title = (t || "").trim().toLowerCase().slice(0, 30);
            const body = b.join("|").trim();
            if (!title || !body) return commandResponse("📝 Usage: .note add wifi | password is 1234");
            db[title] = body.slice(0, 1500);
            save(db);
            return commandResponse(`✅ Saved note *${title}*`);
        }
        if (s === "get") {
            const body = db[raw.toLowerCase()];
            return commandResponse(body ? `📝 *${raw.toLowerCase()}*\n\n${body}` : "❌ No note with that title.");
        }
        if (s === "del") {
            if (!db[raw.toLowerCase()]) return commandResponse("❌ No note with that title.");
            delete db[raw.toLowerCase()];
            save(db);
            return commandResponse("🗑️ Note deleted.");
        }
        const keys = Object.keys(db);
        return commandResponse(keys.length ? `📝 *Your notes*\n\n${keys.map((k, i) => `${i + 1}. ${k}`).join("\n")}\n\nOpen one: .note get <title>` : "📝 No notes yet. Add one with .note add title | text");
    }
};
