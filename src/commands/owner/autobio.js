const { commandResponse } = require("../../utils/branding");
const ab = require("../../services/autobio");

module.exports = {
    name: "autobio", aliases: ["livebio"], category: "owner",
    permission: "owner", description: "Keep your About text updated with the time.",
    usage: ".autobio on|off|text <template>",
    async execute(context) {
        const [sub, ...rest] = context.args || [];
        const d = ab.load();
        const s = (sub || "").toLowerCase();

        if (s === "on" || s === "off") {
            d.enabled = s === "on";
            ab.save(d);
            ab.start(context.sock);
            return commandResponse(`🕒 Auto bio: *${d.enabled ? "ON" : "OFF"}*\nUpdates every 10 minutes.`);
        }
        if (s === "text") {
            const t = rest.join(" ").trim();
            if (!t) return commandResponse("Usage: .autobio text Online | {time} | {date}");
            d.text = t.slice(0, 120);
            ab.save(d);
            ab.start(context.sock);
            return commandResponse(`✅ Template saved.\nPreview: ${ab.render(d.text)}`);
        }
        return commandResponse(
`🕒 *Auto bio*

Status   : ${d.enabled ? "ON ✅" : "OFF ❌"}
Template : ${d.text}
Preview  : ${ab.render(d.text)}

Placeholders: {time} {date} {uptime}
.autobio on | off | text <template>`);
    }
};
