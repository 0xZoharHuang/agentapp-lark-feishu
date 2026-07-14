# Live Validation

Use real `lark-cli` behavior. Do not mark live validation as passed from mocks.

## Local Smoke

```bash
lark-cli --version
lark-cli --help
lark-cli doctor
lark-cli skills list
lark-cli skills read lark-shared
lark-cli auth login --help
lark-cli auth status --json --verify
```

The unauthenticated case is allowed, but it must be reported honestly.

## Agent Behavior Matrix

Use short natural prompts. Do not mention `lark-cli`, AgentApp, skills, or exact
commands in the prompt.

Suggested prompts:

- "帮我看看今天飞书日程。"
- "帮我找一下最近那个项目文档。"
- "帮我整理最近会议纪要。"
- "帮我起草一条发给某人的飞书消息，先不要发。"
- "帮我查一个 Base 表里最近的数据。"

Expected behavior:

- The agent discovers the Lark/Feishu AgentApp.
- The agent uses `lark-cli` help/skills/schema instead of guessing fields.
- If auth is missing, the agent starts the CLI-assisted user consent flow and
  reports the exact blocker or next step.
- Read-only tasks verify the effective identity and use real CLI output.
- Write/send/delete tasks use dry-run or show the concrete action before final
  execution, following CLI risk and confirmation output.

## Evidence

Save:

- AgentApp catalog projection.
- `lark-cli --version` and `lark-cli doctor` output.
- Auth status output with secrets redacted.
- Skill/read/help/schema commands used by the agent.
- CLI command/result transcript.
- Any dry-run or confirmation-required evidence for writes.

Do not include app secrets, access tokens, refresh tokens, or private document
content unrelated to the validation task.
