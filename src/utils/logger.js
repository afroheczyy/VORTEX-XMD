const config = require("../../config/config");

const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const MAGENTA = "\x1b[35m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";

function line(char = "─", length = 52) {
    return char.repeat(length);
}

function banner() {
    console.log("");
    console.log(`${CYAN}${BOLD}╔${line("═")}╗${RESET}`);
    console.log(
        `${CYAN}${BOLD}║${RESET}             ${BOLD}🌀 VORTEX XMD${RESET}             ${CYAN}${BOLD}║${RESET}`
    );
    console.log(
        `${CYAN}${BOLD}║${RESET}          WhatsApp Automation          ${CYAN}${BOLD}║${RESET}`
    );
    console.log(`${CYAN}${BOLD}╚${line("═")}╝${RESET}`);
    console.log("");
    console.log(`${DIM}Owner   :${RESET} ${config.owner.name}`);
    console.log(`${DIM}Version :${RESET} ${config.version}`);
    console.log(`${DIM}Prefix  :${RESET} ${config.bot.prefix}`);
    console.log(`${DIM}Credit  :${RESET} ${config.branding.footer}`);
    console.log("");
}

function info(message) {
    console.log(`${CYAN}ℹ${RESET} ${message}`);
}

function success(message) {
    console.log(`${GREEN}✔${RESET} ${message}`);
}

function warn(message) {
    console.log(`${YELLOW}⚠${RESET} ${message}`);
}

function error(message) {
    console.log(`${RED}✖${RESET} ${message}`);
}

function command(message) {
    console.log(`${MAGENTA}◆${RESET} ${message}`);
}

module.exports = {
    banner,
    info,
    success,
    warn,
    error,
    command
};
