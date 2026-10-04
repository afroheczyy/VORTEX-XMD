const settings = {
    autoViewStatus: true,
    autoLikeStatus: false,
    autoReactStatus: false,
    autoTyping: false,
    autoRecording: false,
    saveStatus: false
};

function getSettings() {
    return { ...settings };
}

function setSetting(name, value) {
    if (!(name in settings)) {
        throw new Error(
            `Unknown status setting: ${name}`
        );
    }

    settings[name] = Boolean(value);

    return settings[name];
}

module.exports = {
    getSettings,
    setSetting
};
