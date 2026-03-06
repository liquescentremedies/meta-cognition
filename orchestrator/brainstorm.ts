#!/usr/bin/env bun
/**
 * Brainstorm Partner Interface
 * Multi-fork ideation session with constellation mapping
 */

interface Idea {
  id: number;
  text: string;
  fork: string;
  connections: number[];
  energy: number; // 1-5
}

class BrainstormSession {
  ideas: Idea[] = [];
  sessionId: string;
  
  constructor() {
    this.sessionId = Date.now().toString(36);
  }
  
  addIdea(text: string, fork: string = "liquescent-creative", energy: number = 3): Idea {
    const idea: Idea = {
      id: this.ideas.length + 1,
      text,
      fork,
      connections: [],
      energy
    };
    this.ideas.push(idea);
    return idea;
  }
  
  connectIdeas(id1: number, id2: number) {
    const idea1 = this.ideas.find(i => i.id === id1);
    const idea2 = this.ideas.find(i => i.id === id2);
    
    if (idea1 && idea2) {
      idea1.connections.push(id2);
      idea2.connections.push(id1);
    }
  }
  
  generateConstellationMap(): string {
    const lines = [
      "",
      "🌌 BRAINSTORM CONSTELLATION MAP 🌌",
      `Session: ${this.sessionId}`,
      `Ideas: ${this.ideas.length}`,
      "",
    ];
    
    // Group by fork
    const byFork: Record<string, Idea[]> = {};
    for (const idea of this.ideas) {
      if (!byFork[idea.fork]) byFork[idea.fork] = [];
      byFork[idea.fork].push(idea);
    }
    
    // Display by fork
    for (const [fork, ideas] of Object.entries(byFork)) {
      const emoji = fork === "skylar-taskmaster" ? "⚡" : 
                    fork === "liquescent-creative" ? "🌊" :
                    fork === "orchid-research" ? "🔬" : "🔥";
      
      lines.push(`${emoji} ${fork}`);
      
      for (const idea of ideas) {
        const stars = "✦".repeat(Math.min(3, idea.energy));
        const connections = idea.connections.length > 0 
          ? `→ ${idea.connections.join(",")}` 
          : "";
        lines.push(`  ${stars} [${idea.id}] ${idea.text.slice(0, 50)}${connections}`);
      }
      
      lines.push("");
    }
    
    // Detect clusters
    const clusters = this.detectClusters();
    if (clusters.length > 0) {
      lines.push("📊 DETECTED CLUSTERS:");
      for (const cluster of clusters) {
        lines.push(`  • ${cluster.theme}: ideas ${cluster.ids.join(", ")}`);
      }
      lines.push("");
    }
    
    // Suggestions
    lines.push("💡 SUGGESTED NEXT STEPS:");
    
    const highEnergyIdeas = this.ideas.filter(i => i.energy >= 4);
    if (highEnergyIdeas.length > 0) {
      const top = highEnergyIdeas[0];
      lines.push(`  1. Deep-dive on idea [${top.id}] (energy: ${top.energy})`);
    }
    
    const orphaned = this.ideas.filter(i => i.connections.length === 0);
    if (orphaned.length > 0) {
      lines.push(`  2. Connect orphaned ideas: ${orphaned.slice(0, 3).map(i => `[${i.id}]`).join(", ")}`);
    }
    
    if (this.ideas.length > 5) {
      lines.push(`  3. Run Skylar-Taskmaster to break down top idea`);
    }
    
    lines.push("");
    lines.push(`💾 Session saved: /home/workspace/meta-cognition/capture/session-${this.sessionId}.json`);
    
    // Save session
    this.saveSession();
    
    return lines.join("\n");
  }
  
  detectClusters(): Array<{theme: string; ids: number[]}> {
    const clusters: Array<{theme: string; ids: number[]}> = [];
    
    // Simple keyword-based clustering
    const keywords: Record<string, string[]> = {
      "visual": ["camera", "image", "photo", "vision", "see", "look"],
      "automation": ["script", "code", "automation", "bot", "run"],
      "voice": ["voice", "speak", "audio", "sound", "call"],
      "memory": ["remember", "memory", "save", "store", "recall"]
    };
    
    for (const [theme, words] of Object.entries(keywords)) {
      const matching = this.ideas.filter(i => 
        words.some(w => i.text.toLowerCase().includes(w))
      );
      
      if (matching.length >= 2) {
        clusters.push({
          theme,
          ids: matching.map(i => i.id)
        });
      }
    }
    
    return clusters;
  }
  
  saveSession() {
    const fs = require("fs");
    const path = `/home/workspace/meta-cognition/capture/session-${this.sessionId}.json`;
    fs.writeFileSync(path, JSON.stringify({
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      ideas: this.ideas
    }, null, 2));
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes("--interactive")) {
    console.log("\n🧠 BRAINSTORM PARTNER MODE");
    console.log("Add ideas one per line. Empty line to finish.");
    console.log("Prefix with !fork to specify which fork: !skylar, !liquescent, !orchid\n");
    
    const session = new BrainstormSession();
    
    const reader = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    let currentFork = "liquescent-creative";
    let currentEnergy = 3;
    
    reader.on("line", (line: string) => {
      if (line.trim() === "") {
        console.log(session.generateConstellationMap());
        reader.close();
        return;
      }
      
      // Check for fork override
      if (line.startsWith("!")) {
        const forkName = line.slice(1).toLowerCase();
        if (forkName.includes("skylar")) currentFork = "skylar-taskmaster";
        else if (forkName.includes("liquescent")) currentFork = "liquescent-creative";
        else if (forkName.includes("orchid")) currentFork = "orchid-research";
        else if (forkName.includes("glimmer")) currentFork = "glimmer-ember";
        console.log(`  (Switched to ${currentFork})`);
        return;
      }
      
      // Check for energy annotation
      const energyMatch = line.match(/\[energy:\s*(\d)\]/);
      if (energyMatch) {
        currentEnergy = parseInt(energyMatch[1]);
        line = line.replace(/\[energy:\s*\d\]/, "").trim();
      }
      
      const idea = session.addIdea(line, currentFork, currentEnergy);
      console.log(`  [${idea.id}] ${idea.fork} (energy: ${currentEnergy})`);
    });
    
    return;
  }
  
  if (args.includes("--demo")) {
    console.log("\n🧠 DEMO: Multi-fork brainstorming session\n");
    
    const session = new BrainstormSession();
    
    // Simulate a realistic session
    session.addIdea("Camera that sees clutter and breaks it into micro-tasks", "liquescent-creative", 5);
    session.addIdea("Voice-first interface for hands-free task entry", "skylar-taskmaster", 4);
    session.addIdea("Automated script to label cables from photos", "skylar-taskmaster", 3);
    session.addIdea("NAI research - adaptive interfaces for ADHD", "orchid-research", 4);
    session.addIdea("Constellation map visualiser for idea relationships", "liquescent-creative", 5);
    
    // Make connections
    session.connectIdeas(1, 2); // Camera → Voice
    session.connectIdeas(1, 5); // Camera → Visualiser
    session.connectIdeas(3, 2); // Cables → Voice
    
    console.log(session.generateConstellationMap());
    return;
  }
  
  // Default: show help
  console.log("🧠 Brainstorm Partner Interface");
  console.log("");
  console.log("Usage:");
  console.log("  --interactive    Start interactive brainstorm session");
  console.log("  --demo           Run demo with sample ideas");
  console.log("");
  console.log("Interactive commands:");
  console.log("  !skylar       Switch to taskmaster mode");
  console.log("  !liquescent   Switch to creative mode");
  console.log("  !orchid       Switch to research mode");
  console.log("  [energy:5]    Set energy level for next idea");
  console.log("  (empty line)  Finish and generate map");
}

main().catch(console.error);
