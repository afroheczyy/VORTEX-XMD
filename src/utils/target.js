function clean(j) { return String(j || "").replace(/:\d+(?=@)/, "").split("@")[0]; }

function getTarget(context) {
    const ci = context.message?.message?.extendedTextMessage?.contextInfo || {};
    const jid = ci.mentionedJid?.[0] || ci.participant;
    if (jid) return jid;
    const num = (context.args?.[0] || "").replace(/\D/g, "");
    return num.length >= 7 ? `${num}@s.whatsapp.net` : null;
}

function isSelf(sock, jid) {
    const me = [sock.user?.id, sock.user?.lid].map(clean);
    return me.includes(clean(jid));
}

module.exports = { getTarget, isSelf };
