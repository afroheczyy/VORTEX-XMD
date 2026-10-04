const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "clap", aliases: ["claps"], category: "fun",
    permission: "public", description: "Put claps between words.",
    usage: ".clap this is important",
    async execute(context) {
        const w = (context.args || []).filter(Boolean);
        if (!w.length) return commandResponse("👏 Usage: .clap this is important");
        return commandResponse(`👏 ${w.join(" 👏 ").toUpperCase()} 👏`);
    }
};
