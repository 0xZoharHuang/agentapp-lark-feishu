# Lark / Feishu AgentApp

Independent third-party AgentApp package for the official
[`lark-cli`](https://github.com/larksuite/cli). This package is maintained
separately from the upstream CLI.

This package does not wrap Lark APIs. Its CLI interface and package references
point agents to `lark-cli` discovery, including the CLI's own embedded skills,
command help, schema introspection, auth flow, JSON envelopes, dry-run previews,
and risk signals.

## What This Package Contains

- `agentapp.json` for AgentApp 0.3 discovery.
- References for official CLI discovery, auth flow, and live validation.
- No local skills; official domain skills are discovered through `lark-cli`.

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
