# Lark / Feishu AgentApp

Thin AgentApp for the official
[`lark-cli`](https://github.com/larksuite/cli).

This package does not wrap Lark APIs. It gives an agent a portable capability
entrypoint for discovering and using `lark-cli`, including the CLI's own
embedded skills, command help, schema introspection, auth flow, JSON envelopes,
dry-run previews, and risk signals.

## What This Package Contains

- `agentapp.json` for AgentApp 0.2 discovery.
- One small entrypoint skill: `skills/lark-feishu/SKILL.md`.
- References for official CLI discovery, auth flow, and live validation.

It intentionally does not contain runtime-specific browser instructions, a UI
surface, copied endpoint schemas, a second OAuth implementation, or an MCP
server. The runtime decides how to present the CLI-returned authorization URL to
the user. The AgentApp only states the portable fact: `lark-cli` returns the
user consent instructions and owns continuation.

## Use

```bash
lark-cli --version
lark-cli doctor
lark-cli skills list
lark-cli skills read lark-shared
lark-cli <domain> --help
lark-cli schema <service.resource.method>
```

For user authorization, prefer the CLI's agent mode where available:

```bash
lark-cli auth login --domain calendar --no-wait --json
lark-cli auth login --device-code <DEVICE_CODE>
```

## Validate

```bash
npm test
npm run test:protocol
npm run check
```

`npm test` verifies the package boundary and optionally probes the installed
`lark-cli` when it is present. `npm run test:protocol` validates the manifest
against the local AgentApp protocol checkout.
