#!/usr/bin/env bun
/**
 * Self-Moulding Calibration System
 * Detects drift in agent responses and auto-calibrates to match user's AuDHD patterns
 */

import { Database } from "bun:sqlite";

const CALIBRATION_DB = "/home/workspace/meta-cognition/orchestrator/calibration.db";

// Baseline patterns from 4,238 conversations
const BASELINE_PATTERNS = {
  message_length: {
    target: 200,
    tolerance: 50,
    max_acceptable: 300
  },
  format: {
    bullets_per_response: 3,
    paragraphs_per_response: 0.5,
    numbered_steps: true
  },
  content: {
    code_blocks_preferred: true,
    voice_first_offered: true,
    exit_amps_included: true
  }
};

// Measure response against baseline
function measureDrift(forkId: string, response: string): {
  drift_score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let drift_score = 0;
  
  // Check length
  if (response.length > BASELINE_PATTERNS.message_length.max_acceptable) {
    const excess = response.length - BASELINE_PATTERNS.message_length.target;
    drift_score += excess / 100;
    issues.push(`Response too long: ${response.length} chars (target: ${BASELINE_PATTERNS.message_length.target})`);
  }
  
  // Check bullet points
  const bulletCount = (response.match(/[•\-\*]/g) || []).length;
  if (bulletCount < BASELINE_PATTERNS.format.bullets_per_response && response.length > 150) {
    drift_score += 2;
    issues.push("Not enough bullet points (use bullets, not paragraphs)");
  }
  
  // Check for numbered steps
  const hasNumbers = /\d+\./.test(response);
  if (!hasNumbers && response.includes("step") || response.includes("first")) {
    drift_score += 1;
    issues.push("Mentioned steps but didn't number them");
  }
  
  // Check for exit ramp
  const hasExitRamp = /stop|pause|break|exit|done/i.test(response);
  if (!hasExitRamp && response.length > 200) {
    drift_score += 1;
    issues.push("No exit ramp mentioned (add 'Stop anytime')");
  }
  
  // Check for voice option
  const hasVoiceOption = /voice|call|speak/i.test(response);
  if (!hasVoiceOption) {
    drift_score += 0.5;
    issues.push("Voice-first option not offered");
  }
  
  return { drift_score, issues };
}

// Log calibration measurement
function logMeasurement(forkId: string, drift_score: number, issues: string[]) {
  const db = new Database(CALIBRATION_DB);
  
  db.run(`
    INSERT INTO calibrations (fork_id, metric, value, context)
    VALUES (?, ?, ?, ?)
  `, [
    forkId,
    "drift_score",
    drift_score,
    JSON.stringify(issues)
  ]);
  
  db.close();
}

// Generate calibration report
function generateCalibrationReport(): string {
  const db = new Database(CALIBRATION_DB);
  
  // Get recent measurements
  const cursor = db.query(`
    SELECT fork_id, metric, value, context, timestamp
    FROM calibrations
    ORDER BY timestamp DESC
    LIMIT 50
  `);
  
  const measurements = cursor.all();
  db.close();
  
  // Calculate average drift by fork
  const forkDrift: Record<string, { total: number; count: number; issues: string[] }> = {};
  
  for (const m of measurements) {
    if (!forkDrift[m.fork_id]) {
      forkDrift[m.fork_id] = { total: 0, count: 0, issues: [] };
    }
    forkDrift[m.fork_id].total += m.value;
    forkDrift[m.fork_id].count += 1;
    
    const context = JSON.parse(m.context || "[]");
    forkDrift[m.fork_id].issues.push(...context);
  }
  
  // Generate report
  const lines = [
    "",
    "🔧 SELF-MOULDING CALIBRATION REPORT",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Total measurements: ${measurements.length}`,
    "",
    "DRIFT SCORES BY FORK:",
    ""
  ];
  
  for (const [forkId, data] of Object.entries(forkDrift)) {
    const avg = data.total / data.count;
    const status = avg > 3 ? "⚠️ NEEDS CALIBRATION" : avg > 1.5 ? "📊 MONITORING" : "✅ ON TARGET";
    
    lines.push(`${forkId}`);
    lines.push(`  Avg drift: ${avg.toFixed(2)} ${status}`);
    lines.push(`  Measurements: ${data.count}`);
    
    // Count issue types
    const issueCounts: Record<string, number> = {};
    for (const issue of data.issues) {
      issueCounts[issue] = (issueCounts[issue] || 0) + 1;
    }
    
    const topIssues = Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (topIssues.length > 0) {
      lines.push("  Top issues:");
      for (const [issue, count] of topIssues) {
        lines.push(`    • ${issue} (${count}x)`);
      }
    }
    
    lines.push("");
  }
  
  lines.push("RECOMMENDATIONS:");
  lines.push("  • Drift > 3.0: Re-calibrate fork immediately");
  lines.push("  • Drift 1.5-3.0: Monitor and adjust gradually");
  lines.push("  • Drift < 1.5: Maintain current calibration");
  lines.push("");
  
  return lines.join("\n");
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes("--init")) {
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
    db.close();
    console.log("✓ Self-moulding database initialized");
    return;
  }
  
  if (args.includes("--report")) {
    console.log(generateCalibrationReport());
    return;
  }
  
  if (args.includes("--measure")) {
    const forkIndex = args.indexOf("--fork");
    const responseIndex = args.indexOf("--response");
    
    if (forkIndex === -1 || responseIndex === -1) {
      console.error("Usage: --measure --fork <fork-id> --response '<text>'");
      process.exit(1);
    }
    
    const forkId = args[forkIndex + 1];
    const response = args[responseIndex + 1];
    
    const { drift_score, issues } = measureDrift(forkId, response);
    logMeasurement(forkId, drift_score, issues);
    
    console.log(`\n📊 Measured ${forkId}:`);
    console.log(`  Drift score: ${drift_score.toFixed(2)}`);
    console.log(`  Issues: ${issues.length > 0 ? issues.join(", ") : "None"}`);
    
    if (drift_score > 3) {
      console.log("\n⚠️  HIGH DRIFT DETECTED - Calibration recommended");
    }
    
    return;
  }
  
  // Default: show help
  console.log("🔧 Self-Moulding Calibration System");
  console.log("");
  console.log("Usage:");
  console.log("  --init                                    Initialize database");
  console.log("  --report                                  Generate calibration report");
  console.log("  --measure --fork <id> --response '<text>' Measure response drift");
  console.log("");
  console.log("Example:");
  console.log('  self-moulding.ts --measure --fork glimmer-ember --response "Here is a long paragraph..."');
}

main().catch(console.error);
