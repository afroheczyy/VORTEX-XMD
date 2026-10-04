const {
    commandResponse
} = require("../../utils/branding");

const {
    getSettings
} = require("../../services/status");

module.exports = {
    name: "settings",
    category: "system",
    permission: "owner",
    description: "View VORTEX automation settings.",
    usage: ".settings",

    async execute() {
        const settings = getSettings();

        return commandResponse(
`╭━━━〔 ⚙️ VORTEX SETTINGS 〕━━━╮
┃
┃  👁️ Auto View     : ${settings.autoViewStatus ? "ON" : "OFF"}
┃  ❤️ Auto Like     : ${settings.autoLikeStatus ? "ON" : "OFF"}
┃  ⚡ Auto React    : ${settings.autoReactStatus ? "ON" : "OFF"}
┃  ⌨️ Auto Typing   : ${settings.autoTyping ? "ON" : "OFF"}
┃  🎙️ Auto Record   : ${settings.autoRecording ? "ON" : "OFF"}
┃  💾 Save Status   : ${settings.saveStatus ? "ON" : "OFF"}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
