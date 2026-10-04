const { commandResponse } = require("../../utils/branding");
const M = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..",
    J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
    S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
    0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....", 6: "-....",
    7: "--...", 8: "---..", 9: "----."
};
const R = Object.fromEntries(Object.entries(M).map(([k, v]) => [v, k]));
module.exports = {
    name: "morse", aliases: ["morsecode"], category: "search",
    permission: "public", description: "Encode or decode Morse code.",
    usage: ".morse encode SOS | .morse decode ... --- ...",
    async execute(context) {
        const [mode, ...rest] = context.args || [];
        const text = rest.join(" ").trim();
        const m = (mode || "").toLowerCase();
        if (!["encode", "decode"].includes(m) || !text)
            return commandResponse("📡 Usage:\n.morse encode SOS\n.morse decode ... --- ...\n(use / between words)");
        const out = m === "encode"
            ? text.toUpperCase().split(/\s+/).map(w => Array.from(w).map(c => M[c] || "").filter(Boolean).join(" ")).join(" / ")
            : text.split(/\s*\/\s*/).map(w => w.split(/\s+/).map(c => R[c] || "?").join("")).join(" ");
        return commandResponse(`📡 *${m}d*\n\n${out}`);
    }
};
