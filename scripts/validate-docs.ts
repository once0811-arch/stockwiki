import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(process.cwd());

const requiredPaths = [
  "AGENTS.md",
  "CLAUDE.md",
  "docs/prd/stockwiki-prd.md",
  "docs/adr/0001-architecture.md",
  "docs/runbooks/local-dev.md",
  "docs/runbooks/moderation.md",
  "docs/evals/core-flows.md",
  "docs/progress/current-phase.md",
  "docs/progress/backlog.md",
  "docs/progress/debt-ledger.md",
  ".claude/settings.json",
  "scripts/hooks/post-edit-check.sh",
  "scripts/hooks/guard-secrets.sh",
  ".github/workflows/ci.yml"
] as const;

const currentPhaseMarkers = [
  "- current phase:",
  "- completed:",
  "- in progress:",
  "- blockers:",
  "- next slice:",
  "- verification snapshot:"
] as const;

const debtLedgerMarkers = [
  "# Debt Ledger",
  "## Resolved",
  "## Remaining"
] as const;

const failures: string[] = [];

function readRequiredFile(relativePath: string): string {
  const absolutePath = resolve(repoRoot, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`missing required path: ${relativePath}`);
    return "";
  }

  return readFileSync(absolutePath, "utf8");
}

for (const relativePath of requiredPaths) {
  if (!existsSync(resolve(repoRoot, relativePath))) {
    failures.push(`missing required path: ${relativePath}`);
  }
}

const claudeMd = readRequiredFile("CLAUDE.md");
if (claudeMd && !claudeMd.includes("@AGENTS.md")) {
  failures.push("CLAUDE.md must import AGENTS.md via @AGENTS.md");
}

const currentPhase = readRequiredFile("docs/progress/current-phase.md");
for (const marker of currentPhaseMarkers) {
  if (currentPhase && !currentPhase.includes(marker)) {
    failures.push(`docs/progress/current-phase.md is missing marker: ${marker}`);
  }
}

const debtLedger = readRequiredFile("docs/progress/debt-ledger.md");
for (const marker of debtLedgerMarkers) {
  if (debtLedger && !debtLedger.includes(marker)) {
    failures.push(`docs/progress/debt-ledger.md is missing marker: ${marker}`);
  }
}

const settingsContent = readRequiredFile(".claude/settings.json");
if (settingsContent) {
  try {
    const settings = JSON.parse(settingsContent) as {
      hooks?: string[];
      phase?: string;
      sourceOfTruth?: string[];
    };

    const currentPhaseMatch = currentPhase.match(/- current phase: (Phase \d+)/);
    if (!currentPhaseMatch) {
      failures.push("docs/progress/current-phase.md must expose a `Phase N` marker");
    } else if (settings.phase !== currentPhaseMatch[1]) {
      failures.push(
        `.claude/settings.json phase (${settings.phase ?? "missing"}) must match docs/progress/current-phase.md (${currentPhaseMatch[1]})`
      );
    }

    for (const hookPath of settings.hooks ?? []) {
      if (!existsSync(resolve(repoRoot, hookPath))) {
        failures.push(`.claude/settings.json references a missing hook: ${hookPath}`);
      }
    }

    for (const sourcePath of settings.sourceOfTruth ?? []) {
      if (!existsSync(resolve(repoRoot, sourcePath))) {
        failures.push(`.claude/settings.json references a missing source-of-truth path: ${sourcePath}`);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push(`.claude/settings.json is not valid JSON: ${message}`);
  }
}

if (failures.length > 0) {
  console.error("Documentation validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Documentation validation passed.");
