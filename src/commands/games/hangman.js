const { commandResponse } = require("../../utils/branding");

const WORDS = ["banana","school","football","internet","computer","chicken","jollof","market","guitar",
    "mountain","elephant","teacher","umbrella","bicycle","sunshine","football","kitchen","diamond",
    "freedom","gadget","helmet","island","journey","lantern","monster","network","office","pencil",
    "rocket","station","tractor","village","whistle","yellow","zebra","airport","blanket","camera"];
const FACES = ["🙂", "😐", "😟", "😨", "😰", "😱", "💀"];
const games = new Map();

const who = m => {
    const k = m?.key || {};
    return String(k.participantAlt || k.participant || k.remoteJidAlt || k.remoteJid || "").split(":")[0];
};

function view(g, note) {
    const word = g.word.split("").map(c => (g.guessed.has(c) ? c : "_")).join(" ");
    const hearts = "❤️".repeat(6 - g.wrong) + "🖤".repeat(g.wrong);
    return commandResponse(
`🎯 *HANGMAN* ${FACES[g.wrong]}

${word.toUpperCase()}

${hearts}
Tried : ${[...g.guessed].join(" ").toUpperCase() || "-"}
${note ? "\n" + note : "\nReply with .hm <letter>"}`);
}

module.exports = {
    name: "hangman", aliases: ["hm"], category: "games",
    permission: "public", description: "Guess the hidden word letter by letter.",
    usage: ".hangman  then  .hm a",
    async execute(context) {
        const jid = context.remoteJid;
        const arg = (context.args?.[0] || "").toLowerCase().replace(/[^a-z]/g, "");
        let g = games.get(jid);
        if (g && Date.now() - g.at > 600000) { games.delete(jid); g = null; }

        if (!g || (arg === "new")) {
            g = { word: WORDS[Math.floor(Math.random() * WORDS.length)], guessed: new Set(), wrong: 0, at: Date.now() };
            games.set(jid, g);
            return view(g, `New game! ${g.word.length} letters.\nGuess with .hm <letter>`);
        }
        if (!arg) return view(g);
        if (arg === "end") { games.delete(jid); return commandResponse(`🛑 Game ended. The word was *${g.word}*.`); }

        g.at = Date.now();
        if (arg.length > 1) {
            if (arg === g.word) {
                games.delete(jid);
                return commandResponse(`🏆 *${context.message?.pushName || "You"}* guessed it!\nThe word was *${g.word}*.`);
            }
            g.wrong++;
        } else {
            if (g.guessed.has(arg)) return view(g, "⚠️ Already tried that letter.");
            g.guessed.add(arg);
            if (!g.word.includes(arg)) g.wrong++;
        }

        if (g.wrong >= 6) {
            games.delete(jid);
            return commandResponse(`💀 *Game over!*\nThe word was *${g.word}*.\nStart again with .hangman`);
        }
        if (g.word.split("").every(c => g.guessed.has(c))) {
            games.delete(jid);
            return commandResponse(`🏆 *You win!*\nThe word was *${g.word}*.\nPlay again with .hangman`);
        }
        return view(g, g.word.includes(arg) ? "✅ Good guess!" : "❌ Wrong!");
    }
};
