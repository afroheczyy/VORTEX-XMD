const { make } = require("./_sitedl");
module.exports = make({ name: "twitter", aliases: ["x", "tw", "xdl"], icon: "🐦", label: "X (Twitter)", hosts: /(^|\.)(twitter\.com|x\.com)$/ });
