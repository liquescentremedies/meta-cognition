#!/usr/bin/env bun
/**
 * Energy Tracker
 * Log and visualize energy patterns over time
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.env.HOME || "", ".glimmer");
const LOG_FILE = join(DATA_DIR, "energy-log.json");

interface EnergyEntry {
  timestamp: string;
  level: number;
  note?: string;
  context?: string;
}

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
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
  const entry: EnergyEntry = {
    timestamp: new Date().toISOString(),
    level,
    note,
    context: process.argv.slice(3).join(" ") || undefined
  };
  entries.push(entry);
  saveLog(entries);
  return entry;
}

function visualizeLog(entries: EnergyEntry[]) {
  if (entries.length === 0) {
    console.log("No energy data yet. Log your first entry!");
    return;
  }
  
  // Last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recent = entries.filter(e => new Date(e.timestamp) >= sevenDaysAgo);
  
  console.log("\n🧠 GLIMMER: Energy Patterns (Last 7 Days)");
  console.log("=".repeat(50));
  
  // Simple bar chart
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
      const label = day.slice(5);
      console.log(`${label} │${bar.padEnd(4)}│ ${avg.toFixed(1)} avg (${levels.length} checks)`);
    });
  
  console.log("\nLegend: █ = energy level (1-4)");
  console.log("        Low 🌙 → Moderate 🌊 → Good ✨ → High 🔥");
  
  // Pattern detection
  const avg = recent.reduce((sum, e) => sum + e.level, 0) / recent.length;
  console.log(`\nOverall average: ${avg.toFixed(1)}`);
  
  if (avg < 2) {
    console.log("⚠️  Energy consistently low — consider rest or support");
  } else if (avg > 3.5) {
    console.log("✨ High energy period — good time for complex tasks");
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === "help" || command === "--help") {
    console.log("🧠 GLIMMER: Energy Tracker");
    console.log("\nCommands:");
    console.log("  log <1-4> [note]  — Log energy level (1=low, 4=high)");
    console.log("  view              — View 7-day pattern");
    console.log("  now               — Quick energy check prompt");
    console.log("\nExamples:");
    console.log('  bun energy-track.ts log 3 "after coffee"');
    console.log('  bun energy-track.ts log 1 "shutdown imminent"');
    process.exit(0);
  }
  
  if (command === "log") {
    const level = parseInt(args[1]);
    if (isNaN(level) || level < 1 || level > 4) {
      console.error("Energy level must be 1-4");
      process.exit(1);
    }
    const note = args.slice(2).join(" ");
    logEnergy(level, note || undefined);
    const labels = ["🌙 Low", "🌊 Moderate", "✨ Good", "🔥 High"];
    console.log(`✓ Logged: ${labels[level - 1]}${note ? ` — "${note}"` : ""}`);
  }
  
  else if (command === "view") {
    const entries = loadLog();
    visualizeLog(entries);
  }
  
  else if (command === "now") {
    console.log("🧠 Energy Check");
    console.log("\nCurrent energy level?");
    console.log("  1 🌙 — Shutdown imminent, rest required");
    console.log("  2 🌊 — Can do small tasks with support");
    console.log("  3 ✨ — Good, normal capacity");
    console.log("  4 🔥 — High energy, excellent for complex work");
    console.log("\nLog with: bun energy-track.ts log <number>");
  }
  
  else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
}

main();
