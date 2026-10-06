const { make } = require("./_sitedl");
module.exports = make({ name: "soundcloud", aliases: ["sc"], icon: "🎧", label: "SoundCloud", hosts: /(^|\.)soundcloud\.com$/, type: "audio" });
