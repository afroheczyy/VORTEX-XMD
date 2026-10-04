const { commandResponse } = require("../../utils/branding");

const games = new Map();
const NUM = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"];
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

const uid = (m, sock) => {
    const k = m?.key || {};
    if (k.fromMe) return String(sock.user?.id || "").split(":")[0];
    return String(k.participantAlt || k.participant || k.remoteJidAlt || k.remoteJid || "").split(":")[0];
};

function board(g) {
    const c = i => (g.b[i] === "X" ? "❌" : g.b[i] === "O" ? "⭕" : NUM[i]);
    return [0, 3, 6].map(r => `${c(r)}${c(r + 1)}${c(r + 2)}`).join("\n");
}
const winner = b => {
    for (const [x, y, z] of LINES) if (b[x] && b[x] === b[y] && b[x] === b[z]) return b[x];
    return null;
};

module.exports = {
    name: "ttt", aliases: ["tictactoe", "xo"], category: "games",
    permission: "public", description: "Tic-tac-toe for two players.",
    usage: ".ttt  then  .ttt join  then  .ttt 5",
    async execute(context) {
        const jid = context.remoteJid;
        const me = uid(context.message, context.sock);
        const name = context.message?.pushName || "Player";
        const a = (context.args?.[0] || "").toLowerCase();
        let g = games.get(jid);
        if (g && Date.now() - g.at > 900000) { games.delete(jid); g = null; }

        if (a === "end" || a === "stop") {
            if (!g) return commandResponse("No game running.");
            games.delete(jid);
            return commandResponse("🛑 Game ended.");
        }

        if (!g) {
            games.set(jid, { b: Array(9).fill(null), x: me, xn: name, o: null, on: "", turn: "X", at: Date.now() });
            return commandResponse(`⭕❌ *TIC-TAC-TOE*\n\n*${name}* wants to play!\nAnother player send *.ttt join*`);
        }

        g.at = Date.now();

        if (a === "join") {
            if (g.o) return commandResponse("⚠️ This game already has two players.");
            if (me === g.x) return commandResponse("😅 You can't play against yourself.");
            g.o = me; g.on = name;
            return commandResponse(`⭕❌ *TIC-TAC-TOE*\n\n❌ ${g.xn}\n⭕ ${g.on}\n\n${board(g)}\n\n❌ ${g.xn} starts. Send .ttt <1-9>`);
        }

        if (/^[1-9]$/.test(a)) {
            if (!g.o) return commandResponse("⏳ Waiting for an opponent. Send .ttt join");
            const mark = g.turn;
            const owner = mark === "X" ? g.x : g.o;
            if (me !== g.x && me !== g.o) return commandResponse("👀 You're not in this game.");
            if (me !== owner) return commandResponse(`⏳ It's ${mark === "X" ? g.xn : g.on}'s turn.`);
            const i = parseInt(a, 10) - 1;
            if (g.b[i]) return commandResponse("⚠️ That square is taken.");
            g.b[i] = mark;

            const w = winner(g.b);
            if (w) {
                games.delete(jid);
                return commandResponse(`🏆 *${w === "X" ? g.xn : g.on}* wins!\n\n${board(g)}\n\nPlay again with .ttt`);
            }
            if (g.b.every(Boolean)) {
                games.delete(jid);
                return commandResponse(`🤝 *Draw!*\n\n${board(g)}\n\nPlay again with .ttt`);
            }
            g.turn = mark === "X" ? "O" : "X";
            return commandResponse(`⭕❌ *TIC-TAC-TOE*\n\n${board(g)}\n\nNext: ${g.turn === "X" ? "❌ " + g.xn : "⭕ " + g.on}`);
        }

        return commandResponse(`⭕❌ *TIC-TAC-TOE*\n\n${g.o ? board(g) : "Waiting for an opponent. Send .ttt join"}\n\nCommands: .ttt join · .ttt <1-9> · .ttt end`);
    }
};
