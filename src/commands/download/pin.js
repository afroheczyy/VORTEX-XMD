const { make } = require("./_sitedl");
module.exports = make({ name: "pin", aliases: ["pinterest", "pindl"], icon: "📌", label: "Pinterest", hosts: /(^|\.)(pinterest\.[a-z.]+|pin\.it)$/ });
