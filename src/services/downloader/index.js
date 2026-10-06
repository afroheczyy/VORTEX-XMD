const fs = require("fs");
const path = require("path");
const os = require("os");
const axios = require("axios");

const TEMP_DIR = path.join(
    os.tmpdir(),
    "vortex-xmd-downloads"
);

const MAX_SIZE_MB = 100;

// Local during development.
// Later, when the Media API is deployed, only change this value.
const MEDIA_API_URL =
    process.env.VORTEX_MEDIA_API_URL ||
    (process.env.VORTEX_API_URL ? process.env.VORTEX_API_URL.replace(/\/+$/, "") : "") ||
    `http://127.0.0.1:${process.env.MEDIA_API_PORT || 5055}`;

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

function isYouTubeUrl(url) {
    try {
        const host =
            new URL(url)
                .hostname
                .toLowerCase()
                .replace(/^www\./, "");

        return (
            host === "youtube.com" ||
            host === "m.youtube.com" ||
            host === "youtu.be" ||
            host === "music.youtube.com"
        );
    } catch {
        return false;
    }
}

function extractFilename(headers, fallback) {
    const disposition =
        headers?.["content-disposition"];

    if (disposition) {
        const match =
            disposition.match(
                /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i
            );

        if (match?.[1]) {
            try {
                return cleanName(
                    decodeURIComponent(match[1])
                );
            } catch {
                return cleanName(match[1]);
            }
        }
    }

    return cleanName(fallback);
}

function getExtension(mode) {
    return mode === "video"
        ? ".mp4"
        : ".mp3";
}

async function getVersion() {
    try {
        const response =
            await axios.get(
                `${MEDIA_API_URL}/api/status`,
                {
                    timeout: 10000
                }
            );

        return (
            response.data?.version ||
            "Media API"
        );
    } catch {
        return null;
    }
}

async function search(query) {
    if (!query?.trim()) {
        throw new Error(
            "Please provide something to search for."
        );
    }

    try {
        const response =
            await axios.get(
                `${MEDIA_API_URL}/api/search`,
                {
                    params: {
                        query: query.trim()
                    },
                    timeout: 30000
                }
            );

        if (
            !response.data?.success ||
            !Array.isArray(response.data.results) ||
            !response.data.results.length
        ) {
            throw new Error(
                "No results found."
            );
        }

        return response.data.results;
    } catch (error) {
        throw formatApiError(
            error,
            "Media search failed."
        );
    }
}

async function resolveQuery(query) {
    const results =
        await search(query);

    const first =
        results[0];

    if (!first?.url) {
        throw new Error(
            "Search result did not contain a media URL."
        );
    }

    return first;
}

function formatApiError(error, fallback) {
    if (error?.response?.data) {
        const data =
            error.response.data;

        if (typeof data === "string") {
            return new Error(
                data.slice(0, 500)
            );
        }

        if (data.error) {
            return new Error(
                String(data.error)
            );
        }

        if (data.message) {
            return new Error(
                String(data.message)
            );
        }
    }

    if (
        error?.code === "ECONNREFUSED"
    ) {
        return new Error(
            "VORTEX Media API is offline. The built-in media API is not running. Check .mediaapi"
        );
    }

    if (
        error?.code === "ETIMEDOUT" ||
        error?.code === "ECONNABORTED"
    ) {
        return new Error(
            "VORTEX Media API timed out."
        );
    }

    return new Error(
        error?.message || fallback
    );
}

async function downloadFromApi(
    url,
    mode = "audio",
    options = {}
) {
    ensureTempDir();

    const stamp =
        `${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`;

    const outputDir =
        path.join(
            TEMP_DIR,
            stamp
        );

    fs.mkdirSync(outputDir, {
        recursive: true
    });

    const extension =
        getExtension(mode);

    let title =
        cleanName(
            options.title ||
            "vortex-media"
        );

    const outputPath =
        path.join(
            outputDir,
            `${title}${extension}`
        );

    try {
        const endpoint =
            mode === "video"
                ? "/api/video"
                : "/api/music";

        const params = {
            url
        };

        if (
            mode === "video" &&
            options.quality
        ) {
            params.quality =
                String(options.quality);
        }

        const response =
            await axios.get(
                `${MEDIA_API_URL}${endpoint}`,
                {
                    params,
                    responseType: "stream",
                    timeout: 10 * 60 * 1000,
                    maxContentLength:
                        MAX_SIZE_MB *
                        1024 *
                        1024,
                    maxBodyLength:
                        MAX_SIZE_MB *
                        1024 *
                        1024
                }
            );

        const headerName =
            extractFilename(
                response.headers,
                `${title}${extension}`
            );

        title =
            cleanName(
                headerName
                    .replace(/\.[^.]+$/, "")
            );

        const finalPath =
            path.join(
                outputDir,
                `${title}${extension}`
            );

        await new Promise(
            (resolve, reject) => {
                const writer =
                    fs.createWriteStream(
                        finalPath
                    );

                response.data.pipe(writer);

                response.data.on(
                    "error",
                    reject
                );

                writer.on(
                    "finish",
                    resolve
                );

                writer.on(
                    "error",
                    reject
                );
            }
        );

        if (!fs.existsSync(finalPath)) {
            throw new Error(
                "Media API returned no file."
            );
        }

        const stat =
            fs.statSync(finalPath);

        const size =
            stat.size;

        const sizeMb =
            size /
            (1024 * 1024);

        if (sizeMb > MAX_SIZE_MB) {
            throw new Error(
                `File is ${sizeMb.toFixed(1)}MB. Maximum allowed is ${MAX_SIZE_MB}MB.`
            );
        }

        return {
            filePath: finalPath,
            title,
            size,
            sizeMb,
            mode,
            source: url,
            cleanup() {
                fs.rmSync(
                    outputDir,
                    {
                        recursive: true,
                        force: true
                    }
                );
            }
        };

    } catch (error) {
        fs.rmSync(
            outputDir,
            {
                recursive: true,
                force: true
            }
        );

        throw formatApiError(
            error,
            "Media download failed."
        );
    }
}

async function downloadAudio(input) {
    let url =
        String(input || "").trim();

    let title = null;

    if (!validateUrl(url)) {
        const result =
            await resolveQuery(url);

        url = result.url;
        title =
            result.title || null;
    }

    if (!isYouTubeUrl(url)) {
        throw new Error(
            "Please provide a YouTube URL or a YouTube search query."
        );
    }

    return downloadFromApi(
        url,
        "audio",
        {
            title
        }
    );
}

async function downloadVideo(
    input,
    quality = 720
) {
    let url =
        String(input || "").trim();

    let title = null;

    if (!validateUrl(url)) {
        const result =
            await resolveQuery(url);

        url = result.url;
        title =
            result.title || null;
    }

    if (!isYouTubeUrl(url)) {
        throw new Error(
            "Please provide a YouTube URL or a YouTube search query."
        );
    }

    const allowed =
        [360, 480, 720];

    const selected =
        allowed.includes(
            Number(quality)
        )
            ? Number(quality)
            : 720;

    return downloadFromApi(
        url,
        "video",
        {
            title,
            quality: selected
        }
    );
}

function cleanupOldDownloads() {
    ensureTempDir();

    const now =
        Date.now();

    for (
        const name of
        fs.readdirSync(TEMP_DIR)
    ) {
        const target =
            path.join(
                TEMP_DIR,
                name
            );

        try {
            const stat =
                fs.statSync(target);

            if (
                now - stat.mtimeMs >
                60 * 60 * 1000
            ) {
                fs.rmSync(
                    target,
                    {
                        recursive: true,
                        force: true
                    }
                );
            }
        } catch {}
    }
}

module.exports = {
    downloadAudio,
    downloadVideo,
    search,
    resolveQuery,
    getVersion,
    cleanupOldDownloads,
    MAX_SIZE_MB,
    TEMP_DIR,
    MEDIA_API_URL
};
