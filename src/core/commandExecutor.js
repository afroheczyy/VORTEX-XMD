const {
    getCommand
} = require("./commandRegistry");

const {
    canExecute
} = require("./permissions");

async function executeCommand(parsed, context) {
    const command =
        getCommand(parsed.command);

    if (!command) {
        return {
            handled: false
        };
    }

    const allowed =
        canExecute(command, context);

    if (!allowed) {
        return {
            handled: true,
            success: false,
            message:
                "╭━━━〔 🌀 VORTEX 〕━━━╮\n" +
                "┃\n" +
                "┃  ❌ You don't have permission\n" +
                "┃  to use this command.\n" +
                "┃\n" +
                "╰━━━━━━━━━━━━━━━━━━━━━━╯"
        };
    }

    const started =
        Date.now();

    try {
        const result =
            await command.execute({
                ...context,
                command,
                args: parsed.args,
                text: parsed.text,
                raw: parsed.raw
            });

        return {
            handled: true,
            success: true,
            command,
            result,
            duration:
                Date.now() - started
        };

    } catch (error) {
        return {
            handled: true,
            success: false,
            command,
            duration:
                Date.now() - started,
            error
        };
    }
}

module.exports = {
    executeCommand
};
