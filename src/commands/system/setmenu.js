const fs = require("fs");
const path = require("path");
const { commandResponse } = require("../../utils/branding");
const FILE = path.join(__dirname, "../../../database/menu-style.json");
const STYLES = ["app", "elite", "vortex", "classic", "box", "minimal", "neon"];

module.exports = {
    name: "setmenu", aliases: ["menustyle"], category: "system",
    permission: "owner", description: "Set the default menu style.",
    usage: ".setmenu <style>",
    async execute(context) {
        const s = (context.args?.[0] || "").toLowerCase();
        if (!STYLES.includes(s)) {
            return commandResponse(`🎨 Pick one: ${STYLES.join(", ")}\nExample: .setmenu elite`);
        }
        fs.mkdirSync(path.dirname(FILE), { recursive: true });
        fs.writeFileSync(FILE, JSON.stringify({ style: s }));
        return commandResponse(`✅ Default menu style: *${s}*`);
    }
};
