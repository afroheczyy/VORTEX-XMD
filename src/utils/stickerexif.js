const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../../database/sticker-pack.json");

function getPack() {
    try {
        const d = JSON.parse(fs.readFileSync(FILE, "utf8"));
        return { pack: d.pack || "VORTEX XMD", author: d.author || "Hector" };
    } catch {
        return { pack: "VORTEX XMD", author: "Hector" };
    }
}

function setPack(pack, author) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify({ pack, author }));
}

function buildExif(pack, author) {
    const json = Buffer.from(JSON.stringify({
        "sticker-pack-id": "vortex-xmd-" + Date.now(),
        "sticker-pack-name": pack,
        "sticker-pack-publisher": author,
        emojis: ["🌀"]
    }), "utf8");
    const head = Buffer.from([
        0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00,
        0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ]);
    const exif = Buffer.concat([head, json]);
    exif.writeUIntLE(json.length, 14, 4);
    return exif;
}

function addExif(buf) {
    try {
        if (buf.length < 16 || buf.toString("ascii", 0, 4) !== "RIFF") return buf;
        const { pack, author } = getPack();
        const exif = buildExif(pack, author);

        const chunk = Buffer.alloc(8 + exif.length + (exif.length % 2));
        chunk.write("EXIF", 0, "ascii");
        chunk.writeUInt32LE(exif.length, 4);
        exif.copy(chunk, 8);

        let body = Buffer.from(buf.subarray(12));
        if (body.toString("ascii", 0, 4) === "VP8X") {
            body[8] |= 0x08;
        } else {
            const vp8x = Buffer.alloc(18);
            vp8x.write("VP8X", 0, "ascii");
            vp8x.writeUInt32LE(10, 4);
            vp8x[8] = 0x18;
            vp8x.writeUIntLE(511, 12, 3);
            vp8x.writeUIntLE(511, 15, 3);
            body = Buffer.concat([vp8x, body]);
        }

        const out = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP"), body, chunk]);
        out.writeUInt32LE(out.length - 8, 4);
        return out;
    } catch {
        return buf;
    }
}

module.exports = { addExif, getPack, setPack };
