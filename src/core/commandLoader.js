const fs = require("fs");
const path = require("path");

const { register } = require("./commandRegistry");

const COMMANDS_DIR = path.resolve(process.cwd(), "src/commands");

let ran = false;
let total = 0;

function loadCommands() {
    if (ran) return total;
    ran = true;

    if (!fs.existsSync(COMMANDS_DIR)) {
        return 0;
    }

    function scan(directory) {
        for (const file of fs.readdirSync(directory)) {
            const fullPath = path.join(directory, file);

            if (fs.statSync(fullPath).isDirectory()) {
                scan(fullPath);
                continue;
            }

            if (!file.endsWith(".js") || file.startsWith("_")) {
                continue;
            }

            try {
                const command = require(fullPath);

                if (!command?.name || !command?.execute) {
                    continue;
                }

                if (register(command)) {
                    total++;
                } else {
                    console.log(`[VORTEX]   ^ from ${path.relative(COMMANDS_DIR, fullPath)}`);
                }
            } catch (error) {
                console.log(
                    `[VORTEX] Failed to load ${path.relative(COMMANDS_DIR, fullPath)}: ${error.message}`
                );
            }
        }
    }

    scan(COMMANDS_DIR);

    return total;
}

module.exports = { loadCommands };
