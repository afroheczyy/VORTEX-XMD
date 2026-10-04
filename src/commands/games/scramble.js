const { commandResponse } = require("../../utils/branding");

const WORDS = ["school","market","chicken","football","computer","internet","teacher","mountain","kitchen",
    "elephant","rocket","village","guitar","diamond","freedom","network","journey","station","blanket","camera",
    "umbrella","sunshine","monster","island","lantern","pencil","bicycle","whistle","airport","tractor"];
const games = new Map();

function shuffle(w) {
    let s = w;
    for (let t = 0; t < 10 && s === w; t++) s = w.split("").sort(() => Math.random() - 0.5).join("");
    return s;
}

module.exports = {
    name: "scramble", aliases: ["unscramble", "wordgame"], category: "games",
    permission: "public", description: "Unscramble the word in 60 seconds.",
    usage: ".scramble  then  .scramble <answer>",
    async execute(context) {
        const jid = context.remoteJid;
        const guess = (context.args?.[0] || "").toLowerCase().trim();
        const g = games.get(jid);

        if (!g) {
            const word = WORDS[Math.floor(Math.random() * WORDS.length)];
            const rec = { word, timer: null };
            rec.timer = setTimeout(() => {
                if (games.get(jid) !== rec) return;
                games.delete(jid);
                context.sock.sendMessage(jid, { text: `⏰ Time's up! The word was *${word}*.` }).catch(() => {});
            }, 60000);
            games.set(jid, rec);
            return commandResponse(`🔀 *WORD SCRAMBLE*\n\n*${shuffle(word).toUpperCase()}*\n\n${word.length} letters · 60 seconds\nAnswer with .scramble <word>`);
        }

        if (!guess) return commandResponse("🔀 A game is running. Answer with .scramble <word>");
        if (guess === g.word) {
            clearTimeout(g.timer);
            games.delete(jid);
            return commandResponse(`🏆 *${context.message?.pushName || "You"}* got it!\nThe word was *${g.word}*.`);
        }
        return commandResponse("❌ Not it. Try again!");
    }
};
