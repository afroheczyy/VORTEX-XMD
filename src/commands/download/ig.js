const { make } = require("./_sitedl");
module.exports = make({ name: "ig", aliases: ["instagram", "igdl", "reel"], icon: "📸", label: "Instagram", hosts: /(^|\.)instagram\.com$/ });
