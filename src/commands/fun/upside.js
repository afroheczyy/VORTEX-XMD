const { commandResponse } = require("../../utils/branding");
const m = { a:"ɐ",b:"q",c:"ɔ",d:"p",e:"ǝ",f:"ɟ",g:"ƃ",h:"ɥ",i:"ᴉ",j:"ɾ",k:"ʞ",l:"l",m:"ɯ",n:"u",o:"o",p:"d",q:"b",r:"ɹ",s:"s",t:"ʇ",u:"n",v:"ʌ",w:"ʍ",x:"x",y:"ʎ",z:"z","?":"¿","!":"¡",".":"˙",",":"'" };
module.exports = {
    name: "upside", aliases: ["flip", "upsidedown"], category: "fun",
    permission: "public", description: "Flip text upside down.",
    usage: ".upside hello",
    async execute(context) {
        const t = (context.args || []).join(" ").trim().toLowerCase();
        if (!t) return commandResponse("🙃 Usage: .upside hello world");
        return commandResponse(`🙃 ${Array.from(t).map(c => m[c] || c).reverse().join("")}`);
    }
};
