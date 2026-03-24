[![npm](https://img.shields.io/npm/v/@iam4x/teleproto)](https://www.npmjs.com/package/@iam4x/teleproto)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue)](./LICENSE)

> Fork of [teleproto](https://github.com/sanyok12345/teleproto), updated dependencies and fixed circular dependencies.

This README is just a fast *quick start*. Upstream discussion happens in the [Telegram chat](https://t.me/teleproto).

# What is @iam4x/teleproto?

`@iam4x/teleproto` is a TypeScript client for Telegram's MTProto API — the same protocol Telegram's own apps speak. Through it, your code gets the full account surface: userbots, multi-account automation, file transfer, raw TL invocation when you need it. If you only need to push notifications from a bot, the official Bot API is simpler; teleproto exists for everything *beyond* that.

# Installing @iam4x/teleproto

```bash
npm install @iam4x/teleproto
```

Pure JavaScript, no native build step — installs cleanly on Alpine, ARM, and serverless runtimes.

# Connecting to Telegram

You need an `api_id` and `api_hash` from <https://my.telegram.org>. Then:

```ts
import { TelegramClient } from "@iam4x/teleproto";
import { StringSession } from "@iam4x/teleproto/sessions";
import { createInterface } from "node:readline/promises";

const rl = createInterface({ input: process.stdin, output: process.stdout });

const apiId = 0;     // from https://my.telegram.org
const apiHash = "";  // from https://my.telegram.org
const session = new StringSession("");

const client = new TelegramClient(session, apiId, apiHash, {
  connectionRetries: 5,
});

await client.start({
  phoneNumber: () => rl.question("Phone: "),
  password:    () => rl.question("2FA password: "),
  phoneCode:   () => rl.question("Code: "),
  onError: console.error,
});

console.log(await client.getMe());
console.log("Session string:", client.session.save());

rl.close();
```

The session string is your saved login. Drop it back into `new StringSession(saved)` next time and skip the auth flow entirely.

# Sending and receiving

Send a message, listen for incoming ones:

```ts
import { NewMessage } from "@iam4x/teleproto/events";

await client.sendMessage("me", { message: "hello from teleproto" });

client.addEventHandler(
  (event) => console.log(event.message.message),
  new NewMessage({}),
);
```

# Raw MTProto API

Every method in Telegram's TL schema is callable directly through `Api.*`. teleproto follows the schema layer-for-layer, so what Telegram adds is usually available here within days.

```ts
import { Api } from "@iam4x/teleproto";

const config = await client.invoke(new Api.help.GetConfig());
```

# Versioning

teleproto uses a three-part version `MAJOR.LAYER.PATCH`:

- **MAJOR** — bumped on breaking API changes in teleproto itself.
- **LAYER** — the Telegram TL schema layer the release ships against
  (e.g. `1.225.x` ships layer 225).
- **PATCH** — fixes and non-breaking improvements within the same layer.

This stays compatible with npm's range syntax:

- `^1.225.0` accepts new layers and patches — recommended default.
- `~1.225.0` sticks to layer 225 only; useful if you depend on
  schema specifics that newer layers might change.
- `1.225.1` is an exact pin.

# Examples

Runnable scripts live in [teleproto_examples/](teleproto_examples/):

- `print_updates.ts` — log every update the client receives
- `print_messages.ts` — listen for new messages only
- `replier.ts` — auto-reply pattern for bots and userbots
- `interactive_terminal.ts` — REPL against a live client

Each is self-contained. Set your credentials at the top and run:

```bash
npx ts-node --transpile-only teleproto_examples/print_updates.ts
```

# Code contributions

Please see [CONTRIBUTING.md][1].

# License

teleproto is distributed under the [MIT License][2].

[1]: ./CONTRIBUTING.md
[2]: ./LICENSE
