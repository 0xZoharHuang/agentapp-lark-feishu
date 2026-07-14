# Auth Flow

`lark-cli` owns Lark/Feishu authentication. The AgentApp does not implement
OAuth or store credentials.

Use the CLI's own current help before acting:

```bash
lark-cli config init --help
lark-cli auth login --help
lark-cli auth status --json --verify
```

## Existing Configuration

Prefer using an existing configured profile when it matches the user's goal:

```bash
lark-cli doctor
lark-cli whoami
lark-cli auth status --json --verify
```

If configuration is missing, follow `lark-cli config init --help`. In agent
contexts, current CLI builds may tell agents to bind an existing app rather than
create a parallel app. Follow that CLI output; do not invent an app setup path.

## User Consent

For agent-driven user login, prefer the non-blocking device flow if supported:

```bash
lark-cli auth login --domain <domain> --no-wait --json
```

The command returns a verification URL and device code. Treat both as opaque.
Show the URL exactly as returned. If a QR code helps the user, generate it with:

```bash
lark-cli auth qrcode <verification_url> --output <relative-path.png>
```

End the turn or wait for the user to complete consent. After the user confirms,
resume with:

```bash
lark-cli auth login --device-code <DEVICE_CODE>
```

Do not cache old verification URLs or device codes. Start a fresh flow when a
flow expires or the user asks to authorize a different account/scope.

If the CLI path uses a localhost callback rather than device flow, the callback
must be reachable by the browser completing consent. Follow the CLI output and
the runtime's available browser/desktop tools; do not assume any private tunnel.

## Scope And Identity

Use the smallest scope/domain that satisfies the task when the user did not ask
for broad authorization. If the task genuinely spans many domains, use the
CLI's recommended or all-domain guidance only after explaining the effect.

Always verify the effective identity before acting on personal resources:

```bash
lark-cli whoami
lark-cli auth status --json --verify
```

Bot identity is not a substitute for user identity. If a command returns empty
or permission errors under `--as bot`, inspect whether the task requires
`--as user`.
