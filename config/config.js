module.exports = {
    botName: "VORTEX XMD",
    version: "1.0.0",

    owner: {
        name: "Hector Hayford Ofori Agyemang",
        shortName: "Hector",
        number: process.env.OWNER_NUMBER || ""
    },

    branding: {
        poweredBy: "Hector",
        footer: "Powered by Hector",
        emoji: "🌀"
    },

    bot: {
        prefix: process.env.BOT_PREFIX || ".",
        timezone: "Africa/Accra"
    },

    whatsapp: {
        sessionDir:
            process.env.SESSION_DIR ||
            "./database/session",

        pairingNumber:
            process.env.PHONE_NUMBER || ""
    },

    session: {
        prefix: "VORTEX-XMD~"
    },

    server: {
        port: Number(process.env.PORT) || 3000
    }
};
