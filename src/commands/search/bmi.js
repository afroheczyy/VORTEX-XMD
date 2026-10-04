const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "bmi", aliases: ["bodymass"], category: "search",
    permission: "public", description: "Calculate BMI from kg and cm.",
    usage: ".bmi 70 175",
    async execute(context) {
        const kg = parseFloat(context.args?.[0]);
        const cm = parseFloat(context.args?.[1]);
        if (!(kg > 0) || !(cm > 50)) return commandResponse("⚖️ Usage: .bmi 70 175\n(weight in kg, height in cm)");
        const v = kg / Math.pow(cm / 100, 2);
        const c = v < 18.5 ? "Underweight" : v < 25 ? "Healthy range" : v < 30 ? "Overweight" : "Obese range";
        return commandResponse(`⚖️ *BMI*\n\nScore : *${v.toFixed(1)}*\nGroup : ${c}\n\nBMI is a rough guide only. Ask a doctor for real advice.`);
    }
};
