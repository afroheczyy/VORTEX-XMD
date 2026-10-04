const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "hello", aliases: ["hi"], category: "general",
    permission: "public", description: "Test command.",
    usage: ".hello",
    async execute() { return commandResponse("👋 Update test works!"); }
};
