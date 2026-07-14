# Official lark-cli Contract

This AgentApp depends on the official `lark-cli` rather than reimplementing
Lark/Feishu APIs.

The upstream project describes `lark-cli` as the official Lark/Feishu CLI,
maintained by the Larksuite team, built for humans and AI agents. It covers
core business domains including Messenger, Docs, Base, Sheets, Slides,
Calendar, Mail, Tasks, Meetings, Markdown, and more.

The AgentApp relies on these upstream surfaces:

- `lark-cli --help` for the current domain list and agent quickstart.
- `lark-cli skills list` and `lark-cli skills read <name>` for current official
  agent skill content.
- `lark-cli <domain> --help` for shortcuts and typed command discovery.
- `lark-cli schema <service.resource.method>` for exact request/response
  fields, supported identities, scopes, and risk metadata.
- `lark-cli api METHOD /open-apis/...` as the raw escape hatch.
- `lark-cli doctor`, `whoami`, and `auth status --json --verify` for local
  health, identity, and token status.

The AgentApp intentionally does not carry:

- copied API schemas,
- copied endpoint catalogs,
- a wrapper CLI,
- a second OAuth implementation,
- a second MCP server definition,
- runtime-specific browser or desktop control instructions.

Use upstream CLI output as current truth. Use this package only as the
capability envelope and operating guidance.

Sources:

- https://github.com/larksuite/cli
- https://open.larksuite.com/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu
