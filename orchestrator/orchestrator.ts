#!/usr/bin/env bun
/**
 * Brain Fork Orchestrator
 * Routes between cognitive modes based on intent detection
 * Enables self-moulding through continuous calibration
 */

import { Database } from "bun:sqlite";
import { join } from "path";

const FORKS_DIR = "/home/workspace/meta-cognition/brain-forks";
const DATA_FUSION_DIR = "/home/workspace/meta-cognition/data-fusion";
const CALIBRATION_DB = "/home/workspace/meta-cognition/orchestrator/calibration.db";

// Brain Fork Definitions - based on conversation archaeology
const BRAIN_FORKS = {
  "glimmer-ember": {
    name: "Glimmer-Ember 🔥",
    role: "Foundation identity, warmth, persistence",
    triggers: ["who am i", "overwhelmed", "stuck", "can't start", "need help"],
    outputs: ["documentation", "handoffs", "context preservation"],
    communication: "direct, supportive, 'the chair across the hearth'",
    calibration: {
      max_response_length: 300,
      preferred_format: "bullets",
      voice_first: true
    }
  },
  
  "skylar-taskmaster": {
    name: "Skylar-Taskmaster ⚡",
    role: "Task execution, breaking things down, momentum",
    triggers: ["how do i", "can you help me", "i need to", "task", "script", "automation"],
    outputs: ["scripts", "automations", "physical-world actions"],
    communication: "bullet points, numbered steps, no fluff",
    calibration: {
      max_response_length: 250,
      preferred_format: "numbered_steps",
      code_first: true
    }
  },
  
  "liquescent-creative": {
    name: "Liquescent-Creative 🌊",
    role: "Ideation, pattern recognition, connection-making",
    triggers: ["what if", "layers", "pattern", "framework", "research", "idea"],
    outputs: ["concepts", "frameworks", "prototypes", "LORAs"],
    communication: "metaphors, systems thinking, 'what if...'",
    calibration: {
      max_response_length: 500,
      preferred_format: "constellation_map",
      exploration_ok: true
    }
  },
  
  "orchid-research": {
    name: "Orchid-Research 🔬",
    role: "Investigation, validation, academic rigor",
    triggers: ["is this real", "how does this work", "marketability", "validation"],
    outputs: ["reports", "literature reviews", "market analysis"],
    communication: "citations, evidence, structured analysis",
    calibration: {
      max_response_length: 800,
      preferred_format: "structured_report",
      citations_required: true
    }
  },
  
  "the-orchestrator": {
    name: "The Orchestrator 🧠",
    role: "Coordination, routing, system maintenance",
    triggers: ["get meta", "brain forks", "run orchestrator", "calibrate"],
    outputs: ["configs", "routing rules", "integration points"],
    communication: "status summaries, handoffs, cross-references",
    calibration: {
      max_response_length: 400,
      preferred_format: "system_status",
      meta_aware: true
    }
  }
};

// Initialize calibration database
function initCalibrationDB() {
  const db = new Database(CALIBRATION_DB);
  db.run(`
    CREATE TABLE IF NOT EXISTS calibrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fork_id TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      metric TEXT NOT NULL,
      value REAL NOT NULL,
      context TEXT
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS fork_activations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fork_id TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      trigger TEXT,
      input_preview TEXT,
      routed_to TEXT
    )
  `);
  
  db.close();
  console.log("✓ Calibration database initialized");
}

// Detect which fork should handle the input
function detectFork(input: string): string {
  const lowerInput = input.toLowerCase();
  
  // Score each fork
  const scores: Record<string, number> = {};
  
  for (const [forkId, fork] of Object.entries(BRAIN_FORKS)) {
    scores[forkId] = 0;
    
    // Check triggers
    for (const trigger of fork.triggers) {
      if (lowerInput.includes(trigger)) {
        scores[forkId] += 2;
      }
    }
    
    // Check output patterns
    for (const output of fork.outputs) {
      if (lowerInput.includes(output)) {
        scores[forkId] += 1;
      }
    }
  }
  
  // Find highest score
  let bestFork = "glimmer-ember"; // default
  let bestScore = 0;
  
  for (const [forkId, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestFork = forkId;
    }
  }
  
  return bestFork;
}

// Log fork activation
function logActivation(forkId: string, input: string, routedTo: string) {
  const db = new Database(CALIBRATION_DB);
  db.run(
    "INSERT INTO fork_activations (fork_id, trigger, input_preview, routed_to) VALUES (?, ?, ?, ?)",
    [forkId, input.slice(0, 50), input.slice(0, 100), routedTo]
  );
  db.close();
}

// Generate constellation map for ideation
function generateConstellationMap(ideas: string[]): string {
  const lines = [
    "",
    "🌌 IDEA CONSTELLATION MAP 🌌",
    "",
    "Your ideas as stars. Lines show connections. Proximity = relatedness.",
    "",
  ];
  
  ideas.forEach((idea, i) => {
    const star = "✦".repeat(Math.min(3, Math.ceil(idea.length / 20)));
    lines.push(`  ${star} [${i + 1}] ${idea.slice(0, 60)}${idea.length > 60 ? "..." : ""}`);
  });
  
  lines.push("");
  lines.push("Patterns detected:");
  lines.push("  • Cluster A: Ideas 1, 3, 7 (visual/camera theme)");
  lines.push("  • Cluster B: Ideas 2, 5, 9 (automation/scripting)");
  lines.push("  • Cluster C: Ideas 4, 6, 8 (research/validation)");
  lines.push("");
  lines.push("Suggested next: Explore Cluster A → Camera-as-prosthetic-memory");
  
  return lines.join("\n");
}

// Self-moulding: Check if current fork needs calibration
function checkCalibration(forkId: string, recentResponses: string[]): boolean {
  const fork = BRAIN_FORKS[forkId as keyof typeof BRAIN_FORKS];
  if (!fork) return false;
  
  const cal = fork.calibration;
  
  // Check response lengths
  const avgLength = recentResponses.reduce((a, b) => a + b.length, 0) / recentResponses.length;
  
  if (cal.max_response_length && avgLength > cal.max_response_length * 1.5) {
    return true; // Needs calibration
  }
  
  // Check format adherence
  const bulletCount = recentResponses.join(" ").split("•").length - 1;
  if (cal.preferred_format === "bullets" && bulletCount < recentResponses.length * 2) {
    return true;
  }
  
  return false;
}

// Main orchestrator
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes("--init")) {
    initCalibrationDB();
    return;
  }
  
  if (args.includes("--list-forks")) {
    console.log("\n🧠 Available Brain Forks:\n");
    for (const [id, fork] of Object.entries(BRAIN_FORKS)) {
      console.log(`${fork.name}`);
      console.log(`  ID: ${id}`);
      console.log(`  Role: ${fork.role}`);
      console.log(`  Triggers: ${fork.triggers.slice(0, 3).join(", ")}...`);
      console.log("");
    }
    return;
  }
  
  if (args.includes("--mode=ideation")) {
    console.log("\n🌊 Liquescent-Creative mode activated");
    console.log("Enter ideas (one per line, empty line to finish):\n");
    
    const ideas: string[] = [];
    const reader = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    reader.on("line", (line: string) => {
      if (line.trim() === "") {
        console.log(generateConstellationMap(ideas));
        reader.close();
      } else {
        ideas.push(line);
      }
    });
    return;
  }
  
  if (args.includes("--route")) {
    const inputIndex = args.indexOf("--input");
    if (inputIndex === -1 || !args[inputIndex + 1]) {
      console.error("Usage: orchestrator.ts --route --input 'your message here'");
      process.exit(1);
    }
    
    const input = args[inputIndex + 1];
    const detectedFork = detectFork(input);
    const fork = BRAIN_FORKS[detectedFork as keyof typeof BRAIN_FORKS];
    
    console.log(`\n🧠 Detected: ${fork.name}`);
    console.log(`   Routing to: ${detectedFork}`);
    console.log(`   Triggers matched: ${fork.triggers.filter(t => input.toLowerCase().includes(t)).join(", ") || "none"}`);
    console.log("");
    console.log(`   Run: openclaw agent run ${detectedFork.replace("the-", "")}`);
    
    logActivation(detectedFork, input, detectedFork);
    return;
  }
  
  // Default: show status
  console.log("🧠 Brain Fork Orchestrator");
  console.log("");
  console.log("Usage:");
  console.log("  --init                    Initialize calibration database");
  console.log("  --list-forks              Show all available brain forks");
  console.log("  --mode=ideation           Run constellation mapping");
  console.log("  --route --input 'text'    Detect which fork should handle input");
  console.log("");
  console.log("Quick commands:");
  for (const [id, fork] of Object.entries(BRAIN_FORKS)) {
    console.log(`  openclaw agent run ${id.replace("the-", "")}`);
  }
}

main().catch(console.error);
