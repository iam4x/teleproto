const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const packageRoot = path.resolve(process.argv[2] || "dist");

function read(filePath) {
    return fs.readFileSync(path.join(packageRoot, filePath), "utf8");
}

function main() {
    const baseClientSource = read("client/telegramBaseClient.js");
    assert.match(
        baseClientSource,
        /require\("\.\.\/Version"\)/,
        "telegramBaseClient must load version from Version.js"
    );
    assert.doesNotMatch(
        baseClientSource,
        /require\("\.\/TelegramClient"\)/,
        "telegramBaseClient must not require TelegramClient at runtime"
    );

    let cycles;
    try {
        const output = execFileSync(
            process.execPath,
            [
                require.resolve("madge/bin/cli.js"),
                packageRoot,
                "--circular",
                "--extensions",
                "js",
                "--no-spinner",
            ],
            { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
        cycles = [];
    } catch (err) {
        const output = `${err.stdout || ""}${err.stderr || ""}`;
        cycles = [...output.matchAll(/\d+\)\s+(.+)/g)].map((match) =>
            match[1].trim()
        );
    }

    const forbidden = cycles.filter((cycle) =>
        cycle.includes("client/telegramBaseClient.js") &&
        cycle.includes("client/TelegramClient.js")
    );

    assert.equal(
        forbidden.length,
        0,
        `Forbidden TelegramClient <-> TelegramBaseClient cycle detected:\n${forbidden.join("\n")}`
    );

    const fixedCycles = [
        "client/messages.js > client/uploads.js",
        "Utils.js > extensions/markdown.js > client/messageParse.js",
    ];

    for (const cycle of fixedCycles) {
        assert.equal(
            cycles.includes(cycle),
            false,
            `Expected circular dependency to be removed: ${cycle}`
        );
    }

    console.log(
        `Circular dependency check passed (${cycles.length} remaining runtime cycles).`
    );
}

main();
