#!/usr/bin/env bun
/**
 * Glimmer — unified ADHD tools entry point
 * Combines: task breakdown, energy tracking, hyperfocus guard
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// === SHARED UTILITIES ===

const DATA_DIR = join(process.env.HOME || "", ".glimmer");

const colors: any = {
  header: "\x1b[35m",
  clarity: "\x1b[36m",
  prep: "\x1b[33m",
  core: "\x1b[32m",
  start: "\x1b[32m",
  decision: "\x1b[35m",
  reset: "\x1b[0m"
};

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function energyLabel(level: number): string {
  const labels = ["🌙 Low", "🌊 Moderate", "✨ Good", "🔥 High"];
  return labels[level - 1] || "🌊 Moderate";
}

// === TASK BREAKDOWN ===

function generateSteps(energy: number) {
  if (energy === 1) {
    return [
      { name: "Write down what 'done' looks like", duration: 2, type: "clarity" },
      { name: "Find one small piece to touch", duration: 3, type: "activation" },
      { name: "Do that one piece (5 min max)", duration: 5, type: "core" },
      { name: "Stop or continue?", duration: 1, type: "decision" }
    ];
  }
  return [
    { name: "What does done look like?", duration: 5, type: "clarity" },
    { name: "What do I need?", duration: 5, type: "prep" },
    { name: "First action (10 min)", duration: 10, type: "core" }
  ];
}

function displayTask(taskName: string, steps: any[], energy: number) {
  console.log("\n" + "=".repeat(50));
  console.log(`${colors.header}🧠 GLIMMER: Task Breakdown${colors.reset}`);
  console.log("=".repeat(50));
  console.log(`\nTask: "${taskName}"\n`);
  console.log(`Energy: ${energyLabel(energy)}\n`);
  console.log("Steps:\n");
  steps.forEach((step, idx) => {
    const color = colors[step.type] || colors.reset;
    const marker = idx === 0 ? "★ START HERE" : "  ";
    console.log(`${marker} ${color}${idx + 1}. ${step.name}${colors.reset} (${step.duration}m)`);
  });
  console.log("\n💡 Say 'done' when finished, 'capture' to save state, 'break' to stop");
  console.log("=".repeat(50) + "\n");
}

function runTask(args: string[]) {
  let energy = 3;
  let taskName = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--energy" && args[i + 1]) {
      const parsed = parseInt(args[i + 1]);
      if (isNaN(parsed) || parsed < 1 || parsed > 4) {
        console.error("Energy level must be 1-4");
        process.exit(1);
      }
      energy = parsed;
      i++;
    } else if (!taskName && !args[i].startsWith("--")) {
      taskName = args[i];
    }
  }

  if (!taskName) {
    console.log(`${colors.header}🧠 GLIMMER: Task Breakdown${colors.reset}`);
    console.log("\nUsage: bun glimmer.ts task 'your task' --energy 3");
    console.log("\nEnergy levels: 1=Low 🌙  2=Moderate 🌊  3=Good ✨  4=High 🔥");
    return;
  }

  displayTask(taskName, generateSteps(energy), energy);
}

// === ENERGY TRACKING ===

const LOG_FILE = join(DATA_DIR, "energy-log.json");

interface EnergyEntry {
  timestamp: string;
  level: number;
  note?: string;
}

function loadLog(): EnergyEntry[] {
  ensureDataDir();
  if (!existsSync(LOG_FILE)) return [];
  try {
    return JSON.parse(readFileSync(LOG_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveLog(entries: EnergyEntry[]) {
  ensureDataDir();
  writeFileSync(LOG_FILE, JSON.stringify(entries, null, 2));
}

function logEnergy(level: number, note?: string) {
  const entries = loadLog();
  entries.push({ timestamp: new Date().toISOString(), level, note });
  saveLog(entries);
}

function visualizeLog(entries: EnergyEntry[]) {
  if (entries.length === 0) {
    console.log("No energy data yet. Log your first entry!");
    return;
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recent = entries.filter(e => new Date(e.timestamp) >= sevenDaysAgo);
  if (recent.length === 0) {
    console.log("No energy data logged in the last 7 days.");
    return;
  }

  console.log("\n🧠 GLIMMER: Energy Patterns (Last 7 Days)");
  console.log("=".repeat(50));

  const byDay: { [key: string]: number[] } = {};
  recent.forEach(e => {
    const day = e.timestamp.split("T")[0];
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(e.level);
  });

  Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([day, levels]) => {
      const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
      const bar = "█".repeat(Math.round(avg));
      console.log(`${day.slice(5)} │${bar.padEnd(4)}│ ${avg.toFixed(1)} avg (${levels.length} checks)`);
    });

  console.log("\nLegend: █ = energy level (1-4)");
  console.log("        Low 🌙 → Moderate 🌊 → Good ✨ → High 🔥");

  const avg = recent.reduce((sum, e) => sum + e.level, 0) / recent.length;
  console.log(`\nOverall average: ${avg.toFixed(1)}`);
  if (avg < 2) console.log("⚠️  Energy consistently low — consider rest or support");
  else if (avg > 3.5) console.log("✨ High energy period — good time for complex tasks");
}

function runEnergy(args: string[]) {
  const command = args[0];

  if (!command || command === "help" || command === "--help") {
    console.log(`${colors.header}🧠 GLIMMER: Energy Tracker${colors.reset}`);
    console.log("\nCommands:");
    console.log("  log <1-4> [note]  — Log energy level");
    console.log("  view              — View 7-day pattern");
    console.log("  now               — Quick energy check prompt");
    return;
  }

  if (command === "log") {
    const level = parseInt(args[1]);
    if (isNaN(level) || level < 1 || level > 4) {
      console.error("Energy level must be 1-4");
      process.exit(1);
    }
    const note = args.slice(2).join(" ") || undefined;
    logEnergy(level, note);
    console.log(`✓ Logged: ${energyLabel(level)}${note ? ` — "${note}"` : ""}`);
  } else if (command === "view") {
    visualizeLog(loadLog());
  } else if (command === "now") {
    console.log(`${colors.header}🧠 Energy Check${colors.reset}`);
    console.log("\nCurrent energy level?");
    console.log("  1 🌙 — Shutdown imminent, rest required");
    console.log("  2 🌊 — Can do small tasks with support");
    console.log("  3 ✨ — Good, normal capacity");
    console.log("  4 🔥 — High energy, excellent for complex work");
    console.log("\nLog with: bun glimmer.ts energy log <number>");
  } else {
    console.error(`Unknown energy command: ${command}`);
    process.exit(1);
  }
}

// === HYPERFOCUS GUARD ===

const SESSION_FILE = join(DATA_DIR, "hyperfocus-session.json");
const HISTORY_FILE = join(DATA_DIR, "hyperfocus-history.json");

interface Session {
  topic: string;
  startedAt: string;
  lastChime?: string;
  totalMinutes: number;
  status: "active" | "paused" | "completed";
}

function loadSession(): Session | null {
  ensureDataDir();
  if (!existsSync(SESSION_FILE)) return null;
  try {
    return JSON.parse(readFileSync(SESSION_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function saveSession(session: Session) {
  ensureDataDir();
  writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function gentleMessage(elapsedMinutes: number, topic: string): string {
  if (elapsedMinutes < 30) return `Flowing on "${topic}" for ${formatDuration(elapsedMinutes)}. Continue or capture progress?`;
  if (elapsedMinutes < 60) return `"${topic}" — ${formatDuration(elapsedMinutes)} of focus. Time check: any deadlines approaching?`;
  if (elapsedMinutes < 120) return `Deep focus on "${topic}" for ${formatDuration(elapsedMinutes)}. Consider: body needs (water, stretch, bio break)?`;
  return `Extended hyperfocus: ${formatDuration(elapsedMinutes)} on "${topic}". Exit ramp available anytime — no guilt.`;
}

function startFocus(topic: string) {
  const existing = loadSession();
  if (existing && existing.status === "active") {
    console.log(`⚠️  Active focus session already running: "${existing.topic}"`);
    console.log("Exit it first with: bun glimmer.ts focus exit");
    return;
  }
  const session: Session = {
    topic,
    startedAt: new Date().toISOString(),
    totalMinutes: 0,
    status: "active"
  };
  saveSession(session);

  console.log("\n🧠 HYPERFOCUS GUARD: Activated");
  console.log("=".repeat(50));
  console.log(`Topic: "${topic}"`);
  console.log(`Started: ${new Date().toLocaleTimeString()}`);
  console.log("\nYou are now in protected flow state.");
  console.log("I will not interrupt unless you ask.");
  console.log("Time awareness available on demand.");
  console.log("=".repeat(50));
  console.log("\nCommands:");
  console.log("  focus status  — Check elapsed time");
  console.log("  focus chime   — Gentle time awareness");
  console.log("  focus exit    — End session, save state");
}

function focusStatus() {
  const session = loadSession();
  if (!session || session.status !== "active") {
    console.log("No active hyperfocus session.");
    console.log("Start one with: bun glimmer.ts focus start 'topic'");
    return;
  }
  const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 60000);
  console.log(`\n🧠 HYPERFOCUS: "${session.topic}"`);
  console.log(`Elapsed: ${formatDuration(elapsed)}`);
  console.log("\n" + gentleMessage(elapsed, session.topic));
}

function focusChime() {
  const session = loadSession();
  if (!session || session.status !== "active") {
    console.log("No active session.");
    return;
  }
  const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 60000);
  console.log("\n🌊 ~ time flows ~ 🌊");
  console.log(gentleMessage(elapsed, session.topic));
  console.log("\nSay 'continue' to dismiss or 'focus exit' to close.");
  session.lastChime = new Date().toISOString();
  saveSession(session);
}

function exitFocus() {
  const session = loadSession();
  if (!session || session.status !== "active") {
    console.log("No active session to exit.");
    return;
  }
  const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 60000);
  session.status = "completed";
  session.totalMinutes = elapsed;

  let history: any[] = [];
  if (existsSync(HISTORY_FILE)) {
    try {
      history = JSON.parse(readFileSync(HISTORY_FILE, "utf-8"));
    } catch {
      history = [];
    }
  }
  history.push({ ...session, endedAt: new Date().toISOString() });
  writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  saveSession(session);

  console.log("\n🧠 HYPERFOCUS: Session Closed");
  console.log("=".repeat(50));
  console.log(`Topic: "${session.topic}"`);
  console.log(`Total time: ${formatDuration(elapsed)}`);
  console.log("Progress captured. Rest well.");
  console.log("=".repeat(50));
}

function runFocus(args: string[]) {
  const command = args[0];

  if (!command || command === "help" || command === "--help") {
    console.log(`${colors.header}🧠 GLIMMER: Hyperfocus Guard${colors.reset}`);
    console.log("\nCommands:");
    console.log("  start 'topic'  — Begin protected focus session");
    console.log("  status         — Check elapsed time");
    console.log("  chime          — Gentle time awareness");
    console.log("  exit           — End session, save state");
    return;
  }

  switch (command) {
    case "start":
      startFocus(args.slice(1).join(" ") || "untitled focus");
      break;
    case "status":
      focusStatus();
      break;
    case "chime":
      focusChime();
      break;
    case "exit":
    case "end":
    case "stop":
      exitFocus();
      break;
    default:
      console.error(`Unknown focus command: ${command}`);
      process.exit(1);
  }
}

// === ROUTER ===

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "help" || command === "--help") {
    console.log("\n" + "=".repeat(50));
    console.log(`${colors.header}🧠 GLIMMER: AuDHD Cognitive Tools${colors.reset}`);
    console.log("=".repeat(50));
    console.log("\nCommands:");
    console.log(`  ${colors.clarity}task${colors.reset}    'task name' [--energy 1-4]  — Break down a task`);
    console.log(`  ${colors.prep}energy${colors.reset}  log <1-4> [note]            — Log energy level`);
    console.log(`  ${colors.prep}energy${colors.reset}  view                        — See 7-day pattern`);
    console.log(`  ${colors.prep}energy${colors.reset}  now                         — Quick energy check`);
    console.log(`  ${colors.core}focus${colors.reset}   start 'topic'               — Start focus session`);
    console.log(`  ${colors.core}focus${colors.reset}   status / chime / exit       — Manage focus session`);
    console.log("\n💡 Exit ramps everywhere — no guilt, no judgment.");
    console.log("=".repeat(50) + "\n");
    return;
  }

  const rest = args.slice(1);
  switch (command) {
    case "task":
      runTask(rest);
      break;
    case "energy":
      runEnergy(rest);
      break;
    case "focus":
      runFocus(rest);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.log("Run without arguments for help.");
      process.exit(1);
  }
}

main();
