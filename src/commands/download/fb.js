const { make } = require("./_sitedl");
module.exports = make({ name: "fb", aliases: ["facebook", "fbdl"], icon: "📘", label: "Facebook", hosts: /(^|\.)(facebook\.com|fb\.com|fb\.watch)$/ });
