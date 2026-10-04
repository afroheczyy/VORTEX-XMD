const fs = require("fs");
const path = require("path");

const {
    register
} = require("./commandRegistry");

const COMMANDS_DIR =
    path.resolve(process.cwd(), "src/commands");

function loadCommands() {
    if (!fs.existsSync(COMMANDS_DIR)) {
        return 0;
    }

    let loaded = 0;

    function scan(directory) {
        for (const file of fs.readdirSync(directory)) {
            const fullPath =
                path.join(directory, file);

            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                scan(fullPath);
                continue;
            }

            if (
                !file.endsWith(".js") ||
                file.startsWith("_")
            ) {
                continue;
            }

            const command =
                require(fullPath);

            if (!command?.name || !command?.execute) {
                continue;
            }

            register(command);
            loaded++;
        }
    }

    scan(COMMANDS_DIR);

    return loaded;
}

module.exports = {
    loadCommands
};
