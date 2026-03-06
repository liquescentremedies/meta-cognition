#!/usr/bin/env bun
/**
 * Task Breakdown for AuDHD
 * Breaks any task into executive-function-friendly micro-steps
 */

function generateSteps(taskName: string, energy: number) {
  // Energy: 1=low, 2=moderate, 3=good, 4=high
  
  if (energy === 1) {
    // Low energy: micro-steps
    return [
      { name: "Write down what 'done' looks like", duration: 2, type: "clarity" },
      { name: "Find one small piece to touch", duration: 3, type: "activation" },
      { name: "Do that one piece (5 min max)", duration: 5, type: "core" },
      { name: "Stop or continue?", duration: 1, type: "decision" }
    ];
  }
  
  // Standard breakdown
  return [
    { name: "What does done look like?", duration: 5, type: "clarity" },
    { name: "What do I need?", duration: 5, type: "prep" },
    { name: "First action (10 min)", duration: 10, type: "core" }
  ];
}

function display(taskName: string, steps: any[], energy: number) {
  const colors: any = {
    header: "\x1b[35m", start: "\x1b[32m", clarity: "\x1b[36m",
    prep: "\x1b[33m", core: "\x1b[32m", decision: "\x1b[35m", reset: "\x1b[0m"
  };
  
  console.log("\n" + "=".repeat(50));
  console.log(`${colors.header}🧠 GLIMMER: Task Breakdown${colors.reset}`);
  console.log("=".repeat(50));
  console.log(`\nTask: "${taskName}"\n`);
  
  const energyLabel = energy >= 4 ? "High 🔥" : energy >= 3 ? "Good ✨" : energy >= 2 ? "Moderate 🌊" : "Low 🌙";
  console.log(`Energy: ${energyLabel}\n`);
  
  console.log("Steps:\n");
  steps.forEach((step, idx) => {
    const color = colors[step.type] || colors.reset;
    const marker = idx === 0 ? "★ START HERE" : "  ";
    console.log(`${marker} ${color}${idx + 1}. ${step.name}${colors.reset} (${step.duration}m)`);
  });
  
  console.log("\n💡 Say 'done' when finished, 'capture' to save state, 'break' to stop");
  console.log("=".repeat(50) + "\n");
}

function main() {
  const args = process.argv.slice(2);
  let energy = 3;
  let taskName = "";
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--energy" && args[i + 1]) {
      energy = parseInt(args[i + 1]);
      i++;
    } else if (!taskName && !args[i].startsWith("--")) {
      taskName = args[i];
    }
  }
  
  if (!taskName) {
    console.log("🧠 GLIMMER: Task Breakdown");
    console.log("\nUsage: bun task-breakdown.ts 'your task' --energy 3");
    console.log("\nEnergy levels:");
    console.log("  4 = High 🔥");
    console.log("  3 = Good ✨");
    console.log("  2 = Moderate 🌊");
    console.log("  1 = Low 🌙");
    process.exit(0);
  }
  
  const steps = generateSteps(taskName, energy);
  display(taskName, steps, energy);
}

main();
