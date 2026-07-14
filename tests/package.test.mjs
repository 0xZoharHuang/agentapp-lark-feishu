import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function commandExists(command) {
  const result = spawnSync("sh", ["-lc", `command -v ${command}`], { encoding: "utf8" });
  return result.status === 0;
}

test("manifest is a thin portable lark-cli AgentApp", () => {
  const manifest = readJson("agentapp.json");
  assert.equal(manifest.schemaVersion, "agentapp/0.2");
  assert.equal(manifest.id, "lark-feishu");
  assert.equal(manifest.cli.name, "lark-cli");
  assert.deepEqual(manifest.runtime.requiredBins, ["lark-cli"]);
  assert.equal(manifest.runtime.network, true);
  assert.deepEqual(manifest.auth.modes, ["cli-browser", "oauth"]);
  assert.equal(Object.hasOwn(manifest, "mcp"), false);
  assert.equal(Object.hasOwn(manifest, "surfaces"), false);
  assert.equal(Object.hasOwn(manifest, "extensions"), false);

  const serialized = JSON.stringify(manifest).toLowerCase();
  for (const forbidden of [
    "target=host",
    "target=station",
    "worksite",
    "companion",
    "browser target",
    "\"host-browser\"",
    "mcp__",
    "actiontoken",
    "workobject",
  ]) {
    assert.equal(serialized.includes(forbidden), false, `manifest leaks ${forbidden}`);
  }

  for (const reference of manifest.references) {
    assert.equal(fs.existsSync(path.join(repoRoot, reference.path)), true, reference.path);
  }
});

test("package keeps one thin entrypoint instead of vendoring upstream skills", () => {
  const skillDirs = fs
    .readdirSync(path.join(repoRoot, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(skillDirs, ["lark-feishu"]);

  const skill = readText("skills/lark-feishu/SKILL.md");
  assert.match(skill, /lark-cli skills list/);
  assert.match(skill, /lark-cli skills read/);
  assert.match(skill, /lark-cli schema/);
  assert.match(skill, /--no-wait --json/);
  assert.doesNotMatch(skill, /target=host|target=station|AgentStation|Worksite|Companion/);
});

test("lark-cli is discoverable and agent-native when installed", (t) => {
  if (!commandExists("lark-cli")) {
    t.skip("lark-cli is not installed on this host");
    return;
  }

  const help = spawnSync("lark-cli", ["--help"], { cwd: repoRoot, encoding: "utf8" });
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /AGENT QUICKSTART/);
  assert.match(help.stdout, /skills\s+Read embedded skill content/);
  assert.match(help.stdout, /schema\s+View API method parameters/);
  assert.match(help.stdout, /api\s+Raw HTTP escape hatch/);

  const authHelp = spawnSync("lark-cli", ["auth", "login", "--help"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  assert.equal(authHelp.status, 0, authHelp.stderr);
  assert.match(authHelp.stdout, /--no-wait/);
  assert.match(authHelp.stdout, /--device-code/);
  assert.match(authHelp.stdout, /verification URL/i);

  const skillsList = spawnSync("lark-cli", ["skills", "list"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  assert.equal(skillsList.status, 0, skillsList.stderr);
  assert.match(skillsList.stdout, /lark-shared/);
});
