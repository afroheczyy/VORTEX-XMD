const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "define", aliases: ["dict", "meaning"], category: "search",
    permission: "public", description: "Get the meaning of a word.",
    usage: ".define <word>",
    async execute(context) {
        const word = (context.args?.[0] || "").trim();
        if (!word) return commandResponse("📖 Usage: .define serendipity");
        try {
            const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
                { signal: AbortSignal.timeout(10000) });
            if (!r.ok) throw new Error();
            const m = (await r.json())[0].meanings[0];
            const def = m.definitions[0];
            return commandResponse(
`╭━━━〔 📖 VORTEX DICTIONARY 〕━━━╮
┃
┃  🔤 Word : ${word}
┃  🏷️ Type : ${m.partOfSpeech}
┃  📝 Meaning:
┃  ${def.definition}
${def.example ? `┃  💬 "${def.example}"\n` : ""}╰━━━━━━━━━━━━━━━━━━━━━━╯`);
        } catch { return commandResponse(`❌ No definition found for "${word}".`); }
    }
};
