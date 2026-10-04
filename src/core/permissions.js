function isOwner(sender, ownerNumber) {
    if (!sender || !ownerNumber) {
        return false;
    }

    const clean = value =>
        String(value).replace(/\D/g, "");

    return clean(sender) === clean(ownerNumber);
}

function canExecute(command, context) {
    const permission =
        command.permission || "public";

    if (permission === "public") {
        return true;
    }

    if (permission === "owner") {
        return Boolean(context.isOwner);
    }

    if (permission === "admin") {
        return Boolean(
            context.isOwner ||
            context.isAdmin
        );
    }

    if (permission === "vip") {
        return Boolean(
            context.isOwner ||
            context.isVip
        );
    }

    return false;
}

module.exports = {
    isOwner,
    canExecute
};
