#!/usr/bin/env bun
/**
 * Hyperfocus Guard
 * Gentle time awareness during deep focus sessions
 */

import { writeFileSync, existsSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.env.HOME || "", ".glimmer");
const SESSION_FILE = join(DATA_DIR, "hyperfocus-session.json");

interface Session {
  topic: string;
  startedAt: string;
  lastChime?: string;
  totalMinutes: number;
  status: "active" | "paused" | "completed";
}

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
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
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

function getGentleMessage(elapsedMinutes: number, topic: string): string {
  // Messages get more specific as time passes
  if (elapsedMinutes < 30) {
    return `Flowing on "${topic}" for ${formatDuration(elapsedMinutes)}. Continue or capture progress?`;
  }
  if (elapsedMinutes < 60) {
    return `"${topic}" — ${formatDuration(elapsedMinutes)} of focus. Time check: any deadlines approaching?`;
  }
  if (elapsedMinutes < 120) {
    return `Deep focus on "${topic}" for ${formatDuration(elapsedMinutes)}. Consider: body needs (water, stretch, bio break)?`;
  }
  return `Extended hyperfocus: ${formatDuration(elapsedMinutes)} on "${topic}". Exit ramp available anytime — no guilt.`;
}

function startSession(topic: string) {
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
  console.log("  status  — Check elapsed time");
  console.log("  chime   — Gentle time awareness");
  console.log("  capture — Save progress and continue");
  console.log("  exit    — End session, save state");
  console.log("  pause   — Pause session");
}

function checkStatus() {
  const session = loadSession();
  if (!session || session.status !== "active") {
    console.log("No active hyperfocus session.");
    console.log("Start one with: bun hyperfocus-guard.ts start 'topic'");
    return;
  }
  
  const start = new Date(session.startedAt);
  const now = new Date();
  const elapsedMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);
  
  console.log(`\n🧠 HYPERFOCUS: "${session.topic}"`);
  console.log(`Elapsed: ${formatDuration(elapsedMinutes)}`);
  console.log(`Status: ${session.status}`);
  console.log("\n" + getGentleMessage(elapsedMinutes, session.topic));
}

function gentleChime() {
  const session = loadSession();
  if (!session || session.status !== "active") {
    console.log("No active session.");
    return;
  }
  
  const start = new Date(session.startedAt);
  const now = new Date();
  const elapsedMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);
  
  console.log("\n🌊 ~ time flows ~ 🌊");
  console.log(getGentleMessage(elapsedMinutes, session.topic));
  console.log("\nSay 'continue' to dismiss or 'exit' to close.");
  
  session.lastChime = now.toISOString();
  saveSession(session);
}

function exitSession() {
  const session = loadSession();
  if (!session) {
    console.log("No session to exit.");
    return;
  }
  
  const start = new Date(session.startedAt);
  const now = new Date();
  const elapsedMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);
  
  session.status = "completed";
  session.totalMinutes = elapsedMinutes;
  
  // Archive to history
  const historyFile = join(DATA_DIR, "hyperfocus-history.json");
  const history = existsSync(historyFile) 
    ? JSON.parse(readFileSync(historyFile, "utf-8")) 
    : [];
  history.push({
    ...session,
    endedAt: now.toISOString()
  });
  writeFileSync(historyFile, JSON.stringify(history, null, 2));
  
  // Clear active session
  saveSession({ ...session, status: "completed" });
  
  console.log("\n🧠 HYPERFOCUS: Session Closed");
  console.log("=".repeat(50));
  console.log(`Topic: "${session.topic}"`);
  console.log(`Total time: ${formatDuration(elapsedMinutes)}`);
  console.log("Progress captured. Rest well.");
  console.log("=".repeat(50));
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === "help" || command === "--help") {
    console.log("🧠 GLIMMER: Hyperfocus Guard");
    console.log("\nCommands:");
    console.log("  start 'topic'  — Begin protected focus session");
    console.log("  status         — Check elapsed time");
    console.log("  chime          — Gentle time awareness");
    console.log("  exit           — End session, save state");
    console.log("\nPurpose:");
    console.log("  Provides time awareness WITHOUT interrupting flow.");
    console.log("  You control when to check.");
    console.log("  Exit ramps available anytime — no guilt.");
    process.exit(0);
  }
  
  switch (command) {
    case "start":
      const topic = args.slice(1).join(" ") || "untitled focus";
      startSession(topic);
      break;
    case "status":
      checkStatus();
      break;
    case "chime":
      gentleChime();
      break;
    case "exit":
    case "end":
    case "stop":
      exitSession();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.log("Run without arguments for help.");
      process.exit(1);
  }
}

main();
