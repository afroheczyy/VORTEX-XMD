const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "weather", aliases: ["w", "temp"], category: "search",
    permission: "public", description: "Get current weather for a city.",
    usage: ".weather <city>",
    async execute(context) {
        const city = (context.args || []).join(" ").trim();
        if (!city) return commandResponse("🌦️ Usage: .weather Accra");
        try {
            const r = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`,
                { signal: AbortSignal.timeout(10000) });
            const d = await r.json();
            const c = d.current_condition[0];
            const a = d.nearest_area[0];
            return commandResponse(
`╭━━━〔 🌦️ VORTEX WEATHER 〕━━━╮
┃
┃  📍 ${a.areaName[0].value}, ${a.country[0].value}
┃  🌡️ Temp     : ${c.temp_C}°C (feels ${c.FeelsLikeC}°C)
┃  ☁️ Sky      : ${c.weatherDesc[0].value}
┃  💧 Humidity : ${c.humidity}%
┃  💨 Wind     : ${c.windspeedKmph} km/h
╰━━━━━━━━━━━━━━━━━━━━━━╯`);
        } catch { return commandResponse("❌ Couldn't find that city."); }
    }
};
