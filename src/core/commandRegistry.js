const commands = new Map();

function register(command) {
    if (!command?.name) {
        console.log("[VORTEX] Skipped a command with no name");
        return false;
    }

    const name = command.name.toLowerCase();

    if (commands.has(name)) {
        console.log(`[VORTEX] Duplicate command skipped: ${name}`);
        return false;
    }

    commands.set(name, {
        aliases: [],
        category: "general",
        permission: "public",
        description: "",
        usage: "",
        ...command,
        name
    });

    return true;
}

function registerMany(list) {
    for (const command of list) {
        register(command);
    }
}

function getCommand(name) {
    if (!name) return null;

    const key = name.toLowerCase();

    if (commands.has(key)) {
        return commands.get(key);
    }

    for (const command of commands.values()) {
        if (command.aliases?.some(alias => alias.toLowerCase() === key)) {
            return command;
        }
    }

    return null;
}

function getCommands() {
    return [...commands.values()];
}

function getCategories() {
    const categories = {};

    for (const command of commands.values()) {
        const category = command.category || "general";

        if (!categories[category]) {
            categories[category] = [];
        }

        categories[category].push(command);
    }

    return categories;
}

module.exports = {
    register,
    registerMany,
    getCommand,
    getCommands,
    getCategories
};
