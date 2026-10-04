const {
    getSettings: getProtectionSettings,
    setSetting: setProtectionSetting
} = require("../../services/protection");

const {
    getSettings: getEventSettings,
    setSetting: setEventSetting
} = require("../../services/group/events");

module.exports = {
    name: "gsettings",
    aliases: ["groupsettings", "groupconfig"],
    permission: "admin",

    async execute(context) {
        if (!context.isGroup) {
            return {
                text:
                    "❌ This command can only be used in groups."
            };
        }

        const groupJid = context.remoteJid;
        const args = context.args || [];

        // ─────────────── SHOW SETTINGS ───────────────

        if (!args.length) {
            const protection =
                getProtectionSettings(groupJid);

            const events =
                getEventSettings(groupJid);

            return {
                text:
                    "╭━━━〔 🌀 VORTEX GROUP SETTINGS 〕━━━╮\n" +
                    "┃\n" +
                    `┃ 👋 Welcome   : ${events.welcome ? "🟢 ON" : "🔴 OFF"}\n` +
                    `┃ 🚪 Goodbye   : ${events.goodbye ? "🟢 ON" : "🔴 OFF"}\n` +
                    `┃ 🔗 Anti-Link : ${protection.antiLink ? "🟢 ON" : "🔴 OFF"}\n` +
                    `┃ 🚫 Badword   : ${protection.badword ? "🟢 ON" : "🔴 OFF"}\n` +
                    `┃ ⚠️ Anti-Spam : ${protection.antiSpam ? "🟢 ON" : "🔴 OFF"}\n` +
                    "┃\n" +
                    "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n" +
                    "Use `.gsettings <feature> on/off`"
            };
        }

        const feature =
            String(args[0]).toLowerCase();

        const action =
            String(args[1] || "").toLowerCase();

        const protectionFeatures = [
            "antilink",
            "anti-link",
            "antispam",
            "anti-spam",
            "badword",
            "badwords"
        ];

        const eventFeatures = [
            "welcome",
            "goodbye"
        ];

        if (
            !action ||
            !["on", "off", "enable", "disable"].includes(action)
        ) {
            return {
                text:
                    "❌ Usage:\n\n" +
                    ".gsettings welcome on\n" +
                    ".gsettings goodbye on\n" +
                    ".gsettings antilink on\n" +
                    ".gsettings antispam on\n" +
                    ".gsettings badword on"
            };
        }

        const enabled =
            action === "on" ||
            action === "enable";

        // ─────────────── PROTECTION ───────────────

        if (protectionFeatures.includes(feature)) {
            let settingName;

            if (
                feature === "antilink" ||
                feature === "anti-link"
            ) {
                settingName = "antiLink";
            }

            if (
                feature === "antispam" ||
                feature === "anti-spam"
            ) {
                settingName = "antiSpam";
            }

            if (
                feature === "badword" ||
                feature === "badwords"
            ) {
                settingName = "badword";
            }

            setProtectionSetting(
                groupJid,
                settingName,
                enabled
            );

            return {
                text:
                    `${enabled ? "✅" : "🛑"} *${settingName}* ` +
                    `${enabled ? "enabled" : "disabled"}.`
            };
        }

        // ─────────────── GROUP EVENTS ───────────────

        if (eventFeatures.includes(feature)) {
            setEventSetting(
                groupJid,
                feature,
                enabled
            );

            return {
                text:
                    `${enabled ? "✅" : "🛑"} *${feature} system* ` +
                    `${enabled ? "enabled" : "disabled"}.`
            };
        }

        return {
            text:
                `❌ Unknown group setting: ${feature}\n\n` +
                "Use `.gsettings` to view available settings."
        };
    }
};
