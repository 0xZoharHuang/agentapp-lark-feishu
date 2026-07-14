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
  assert.equal(manifest.schemaVersion, "agentapp/0.3");
  assert.equal(manifest.id, "lark-feishu");
  assert.equal(manifest.interfaces.length, 1);
  assert.equal(manifest.interfaces[0].id, "lark-cli");
  assert.equal(manifest.interfaces[0].kind, "cli");
  assert.equal(manifest.interfaces[0].discovery.command, "lark-cli");
  assert.deepEqual(manifest.interfaces[0].requirements.requiredBins, ["lark-cli"]);
  assert.equal(manifest.interfaces[0].requirements.network, true);
  assert.equal(manifest.interfaces[0].requirements.requiresUserAccount, true);
  assert.equal(manifest.interfaces[0].requirements.requiresUserDesktop, true);
  for (const retired of ["cli", "auth", "runtime", "effects", "mcp", "skills"]) {
    assert.equal(Object.hasOwn(manifest, retired), false);
  }
  assert.equal(Object.hasOwn(manifest.interfaces[0], "requiredSkills"), false);
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
    assert.equal(reference.path.startsWith("skills/"), false, reference.path);
    assert.equal(fs.existsSync(path.join(repoRoot, reference.path)), true, reference.path);
  }
});

test("package inventory is zero-skill and keeps native discovery guidance", () => {
  const manifest = readJson("agentapp.json");
  const packageJson = readJson("package.json");
  const cli = manifest.interfaces[0];

  assert.equal(fs.existsSync(path.join(repoRoot, "skills")), false);
  assert.deepEqual(packageJson.files, ["agentapp.json", "references", "README.md", "LICENSE"]);
  assert.deepEqual(manifest.references.map(({ id }) => id), ["official-cli", "auth-flow", "live-validation"]);
  assert.deepEqual(cli.references, ["official-cli", "auth-flow"]);
  assert.match(cli.discovery.discoveryHint, /lark-cli skills list/);
  assert.match(cli.discovery.discoveryHint, /lark-cli skills read/);
  assert.match(cli.discovery.discoveryHint, /lark-cli schema/);

  const authGuide = readText("references/auth-flow.md");
  assert.match(authGuide, /--no-wait --json/);
  assert.doesNotMatch(authGuide, /target=host|target=station|AgentStation|Worksite|Companion/);
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
