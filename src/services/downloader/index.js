const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const TEMP_DIR = path.join(
    os.tmpdir(),
    "vortex-xmd-downloads"
);

const MAX_SIZE_MB = 100;

function ensureTempDir() {
    fs.mkdirSync(TEMP_DIR, {
        recursive: true
    });
}

function cleanName(value) {
    return String(value || "vortex-media")
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120) || "vortex-media";
}

function validateUrl(url) {
    try {
        const parsed = new URL(url);

        return (
            parsed.protocol === "http:" ||
            parsed.protocol === "https:"
        );
    } catch {
        return false;
    }
}

async function getVersion() {
    try {
        const { stdout } =
            await execFileAsync(
                "yt-dlp",
                ["--version"],
                {
                    timeout: 15000,
                    maxBuffer: 1024 * 1024
                }
            );

        return stdout.trim();
    } catch {
        return null;
    }
}

async function getFileSize(filePath) {
    try {
        const stat = fs.statSync(filePath);
        return stat.size;
    } catch {
        return 0;
    }
}

async function download(url, mode = "audio") {
    if (!validateUrl(url)) {
        throw new Error(
            "Please provide a valid http/https URL."
        );
    }

    ensureTempDir();

    const stamp =
        `${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`;

    const outputDir =
        path.join(TEMP_DIR, stamp);

    fs.mkdirSync(outputDir, {
        recursive: true
    });

    const outputTemplate =
        path.join(
            outputDir,
            "%(title).120s_%(id)s.%(ext)s"
        );

    const args = [
        "--no-playlist",
        "--no-warnings",
        "--restrict-filenames",
        "-o",
        outputTemplate,
        url
    ];

    if (mode === "audio") {
        args.push(
            "-x",
            "--audio-format",
            "mp3",
            "--audio-quality",
            "0"
        );
    } else {
        args.push(
            "-f",
            "bv*+ba/b",
            "--merge-output-format",
            "mp4"
        );
    }

    let stdout = "";

    try {
        const result =
            await execFileAsync(
                "yt-dlp",
                args,
                {
                    timeout: 300000,
                    maxBuffer: 8 * 1024 * 1024
                }
            );

        stdout =
            `${result.stdout || ""}\n${result.stderr || ""}`;
    } catch (error) {
        fs.rmSync(outputDir, {
            recursive: true,
            force: true
        });

        const message =
            error?.stderr ||
            error?.stdout ||
            error?.message ||
            "yt-dlp failed.";

        throw new Error(
            String(message)
                .split("\n")
                .filter(Boolean)
                .slice(-3)
                .join(" ")
        );
    }

    const files =
        fs.readdirSync(outputDir)
            .map(name =>
                path.join(outputDir, name)
            )
            .filter(file =>
                fs.statSync(file).isFile()
            );

    if (!files.length) {
        fs.rmSync(outputDir, {
            recursive: true,
            force: true
        });

        throw new Error(
            "Downloader finished but no media file was created."
        );
    }

    const preferred =
        mode === "audio"
            ? files.find(file =>
                file.toLowerCase().endsWith(".mp3")
            )
            : files.find(file =>
                file.toLowerCase().endsWith(".mp4")
            );

    const filePath =
        preferred || files[0];

    const size =
        await getFileSize(filePath);

    const sizeMb =
        size / (1024 * 1024);

    if (sizeMb > MAX_SIZE_MB) {
        fs.rmSync(outputDir, {
            recursive: true,
            force: true
        });

        throw new Error(
            `File is ${sizeMb.toFixed(1)}MB. Maximum allowed is ${MAX_SIZE_MB}MB.`
        );
    }

    const baseName =
        path.basename(filePath);

    const title =
        cleanName(
            baseName
                .replace(/\.[^.]+$/, "")
                .replace(/_[A-Za-z0-9_-]+$/, "")
        );

    return {
        filePath,
        title,
        size,
        sizeMb,
        mode,
        cleanup() {
            fs.rmSync(outputDir, {
                recursive: true,
                force: true
            });
        }
    };
}

async function downloadAudio(url) {
    return download(url, "audio");
}

async function downloadVideo(url) {
    return download(url, "video");
}

function cleanupOldDownloads() {
    ensureTempDir();

    const now = Date.now();

    for (const name of fs.readdirSync(TEMP_DIR)) {
        const target =
            path.join(TEMP_DIR, name);

        try {
            const stat = fs.statSync(target);

            if (
                now - stat.mtimeMs >
                60 * 60 * 1000
            ) {
                fs.rmSync(target, {
                    recursive: true,
                    force: true
                });
            }
        } catch {}
    }
}

module.exports = {
    download,
    downloadAudio,
    downloadVideo,
    getVersion,
    cleanupOldDownloads,
    MAX_SIZE_MB,
    TEMP_DIR
};
