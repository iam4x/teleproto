const assert = require("node:assert/strict");
const path = require("node:path");

function resolveSpec(specifier) {
    if (
        specifier.startsWith(".") ||
        specifier.startsWith("/") ||
        specifier.startsWith("..")
    ) {
        return path.resolve(process.cwd(), specifier);
    }
    return specifier;
}

function main() {
    const specifier = process.argv[2] || "teleproto";
    const packageRoot = resolveSpec(specifier);
    const packageEvents = `${packageRoot}/events`;

    const teleproto = require(packageRoot);
    const events = require(packageEvents);

    assert.equal(typeof teleproto.TelegramClient, "function");
    assert.equal(typeof teleproto.sessions?.MemorySession, "function");
    assert.equal(typeof events.Raw, "function");

    const client = new teleproto.TelegramClient(
        new teleproto.sessions.MemorySession(),
        1,
        "test-hash",
        {}
    );

    assert.ok(client);
    assert.equal(client.__version__, teleproto.version);
}

main();
