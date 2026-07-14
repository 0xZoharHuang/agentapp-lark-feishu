---
name: lark-feishu
version: 1.0.0
description: "Lark/Feishu entrypoint: use the official lark-cli to operate Docs, Drive, Sheets, Base, Calendar, IM, Mail, Tasks, Meetings, Approval, OKR, Apps, and related Open Platform APIs. Prefer the CLI's own embedded skills, shortcuts, schemas, JSON output, dry-run previews, and risk signals."
metadata:
  requires:
    bins: ["lark-cli"]
  cliHelp: "lark-cli --help"
---

# Lark / Feishu

Use this skill when the user asks for Lark or Feishu work: documents, Drive files,
Sheets, Base, Calendar, IM messages, Mail, Tasks, Meetings, approvals, OKRs,
contacts, wiki, slides, apps, or raw Lark Open Platform operations.

This AgentApp is a thin package around the official `lark-cli`. Do not
reimplement Lark APIs in the AgentApp. Treat `lark-cli` as the source of truth
for current commands, schemas, auth, scopes, identities, and risk metadata.

## First Moves

1. Check the CLI and current profile:

```bash
lark-cli --version
lark-cli doctor
lark-cli whoami
lark-cli auth status --json --verify
```

2. Read current official skill guidance from the CLI when the task maps to a
   domain:

```bash
lark-cli skills list
lark-cli skills read lark-shared
lark-cli skills read lark-calendar
lark-cli skills read lark-doc
lark-cli skills read lark-drive
lark-cli skills read lark-sheets
lark-cli skills read lark-base
lark-cli skills read lark-im
lark-cli skills read lark-mail
lark-cli skills read lark-task
```

Read only the skills needed for the current task. If a command's exact inputs
are unclear, inspect the command or method instead of guessing:

```bash
lark-cli <domain> --help
lark-cli <domain> <resource> --help
lark-cli schema <service.resource.method>
```

## Command Choice

Use the CLI's three layers in this order:

1. Shortcut commands such as `lark-cli calendar +agenda` or
   `lark-cli drive +search`.
2. Typed API commands generated from Open Platform metadata.
3. Raw `lark-cli api METHOD /open-apis/...` only when the official skills and
   typed commands do not cover the task.

Prefer JSON output for machine work. Successful JSON has `ok: true` on stdout.
Errors have `ok: false` on stderr. Do not judge success by a top-level
`code == 0`.

## Auth

For user-owned resources, prefer user identity and verify it:

```bash
lark-cli auth status --json --verify
lark-cli whoami
```

If login is needed, use the CLI's agent mode when available:

```bash
lark-cli auth login --domain <domain> --no-wait --json
lark-cli auth login --device-code <DEVICE_CODE>
```

Send the CLI's authorization URL to the user exactly as returned. If useful,
generate a QR code with `lark-cli auth qrcode`. Do not cache verification URLs
or device codes beyond the active authorization flow.

Bot identity and user identity behave differently. Use `--as user` for personal
calendar, docs, drive, mail, and other user resources. Use `--as bot` only when
the task is explicitly app/bot-owned or the CLI guidance says so.

## Effects And Safety

The CLI can call cloud APIs, upload/download files, send messages or mail,
publish docs/apps, and mutate real Lark/Feishu state. Use `--dry-run` where the
CLI supports it before risky writes. If the CLI reports a confirmation-required
or high-risk write state, show the concrete action and parameters to the user
and continue only after explicit confirmation.

Do not invent missing permissions. If the CLI returns missing scopes, a console
URL, or a domain-specific auth hint, report that layer clearly and use the CLI's
suggested next command.

## Maintenance

If the CLI is missing, stale, or unhealthy, use `lark-cli --help`,
`lark-cli update`, the official install command, and `lark-cli doctor` to decide
the smallest repair needed for the user's goal. Do not update or install as a
background side effect unrelated to the current task.
