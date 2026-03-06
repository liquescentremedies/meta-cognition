#!/usr/bin/env python3
"""Actual Idea Extractor - Pull concepts from conversations."""
import json, sqlite3, re
from pathlib import Path
from datetime import datetime
from collections import Counter

FUSION_DB = "/home/workspace/meta-cognition/data-fusion/fused_cognition.db"
FUSION_DIR = "/home/workspace/meta-cognition/data-fusion"

ADHD_KEYWORDS = ["adhd", "autism", "neurodivergent", "executive", "focus", "hyperfocus", "distracted", "overwhelm", "scattered", "plan", "task", "remind", "remember", "schedule", "organize", "organise", "routine", "structure"]

def extract_ideas_from_conversation(messages):
    """Extract actual ideas from messages."""
    ideas = {"concepts": [], "projects": [], "accommodations": [], "unfinished": []}
    
    for msg in messages:
        sender = msg.get("sender", "unknown")
        text = msg.get("content", "")
        if not isinstance(text, str):
            continue
            
        lower = text.lower()
        
        # Extract "I want/I need" statements
        for pattern in [r"I want\s+(.{10,200})", r"I need\s+(.{10,200})", r"I'd like\s+(.{10,200})"]:
            for match in re.findall(pattern, text, re.IGNORECASE)[:2]:
                ideas["concepts"].append({"text": match.strip(), "sender": sender})
        
        # Extract project mentions
        if any(x in lower for x in ["project", "build", "create", "design", "system"]):
            for sent in re.split(r'[.!?]+', text):
                if any(x in sent.lower() for x in ["project", "build", "create", "design", "system", "app", "tool"]):
                    if 30 < len(sent) < 300:
                        ideas["projects"].append({"text": sent.strip()})
                        break
        
        # Extract ADHD accommodations
        if any(x in lower for x in ADHD_KEYWORDS[:6]):
            for sent in re.split(r'[.!?]+', text):
                if any(x in sent.lower() for x in ADHD_KEYWORDS) and 40 < len(sent) < 250:
                    ideas["accommodations"].append({"text": sent.strip()})
                    break
        
        # Extract unfinished items
        if any(x in lower for x in ["todo", "need to", "still need", "haven't", "unfinished"]):
            for sent in re.split(r'[.!?]+', text):
                if any(x in sent.lower() for x in ["todo", "need to", "still need", "haven't done"]):
                    if 25 < len(sent) < 200:
                        ideas["unfinished"].append({"text": sent.strip()})
                        break
    
    return ideas

def main():
    print("Loading conversations...")
    conn = sqlite3.connect(FUSION_DB)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, source, title, timestamp FROM conversations")
    
    ideas_list = []
    for row in cursor:
        conv_id, source, title, timestamp = row
        
        # Load messages
        cursor2 = conn.cursor()
        cursor2.execute("SELECT sender, content FROM messages WHERE conv_id = ?", (conv_id,))
        
        messages = []
        for msg_row in cursor2:
            sender, content = msg_row
            messages.append({"sender": sender, "content": content})
        
        ideas = extract_ideas_from_conversation(messages)
        if any(len(ideas[k]) > 0 for k in ["concepts", "projects", "accommodations", "unfinished"]):
            ideas["title"] = title
            ideas["source"] = source
            ideas["timestamp"] = timestamp
            ideas["message_count"] = len(messages)
            ideas_list.append(ideas)
    
    print(f"\n✓ Extracted from {len(ideas_list)} conversations")
    
    total_concepts = sum(len(i["concepts"]) for i in ideas_list)
    total_projects = sum(len(i["projects"]) for i in ideas_list)
    total_accoms = sum(len(i["accommodations"]) for i in ideas_list)
    total_unfinished = sum(len(i["unfinished"]) for i in ideas_list)
    
    print(f"  Concepts: {total_concepts}")
    print(f"  Projects: {total_projects}")
    print(f"  Accommodations: {total_accoms}")
    print(f"  Unfinished: {total_unfinished}")
    
    # Write report
    output_path = Path(FUSION_DIR) / "extracted_ideas_actual.md"
    lines = [
        "# Actually Extracted Ideas",
        "",
        f"*Generated: {datetime.now().isoformat()}*",
        f"*Conversations with ideas: {len(ideas_list)}*",
        "",
        f"**Totals:** {total_concepts} concepts | {total_projects} projects | {total_accoms} accommodations | {total_unfinished} unfinished",
        "",
        "---",
        "",
    ]
    
    # Top conversations
    lines.extend(["## 🔥 Top Conversations by Idea Count", "",])
    sorted_by_ideas = sorted(ideas_list, key=lambda x: len(x["concepts"]) + len(x["projects"]), reverse=True)[:20]
    
    for idea in sorted_by_ideas:
        lines.extend([
            f"### {idea['title']}",
            f"*{idea['message_count']} messages | {idea['source']} | {idea['timestamp'][:10] if idea['timestamp'] else 'unknown'}*",
            "",
        ])
        
        if idea["concepts"]:
            lines.extend(["**Concepts/Intents:**"])
            for c in idea["concepts"][:5]:
                lines.append(f"- {c['text'][:120]}...")
            lines.append("")
        
        if idea["projects"]:
            lines.extend(["**Projects:**"])
            for p in idea["projects"][:3]:
                lines.append(f"- {p['text'][:120]}...")
            lines.append("")
        
        if idea["accommodations"]:
            lines.extend(["**Accommodations:**"])
            for a in idea["accommodations"][:3]:
                lines.append(f"- {a['text'][:150]}...")
            lines.append("")
        
        lines.append("---")
        lines.append("")
    
    with open(output_path, 'w') as f:
        f.write('\n'.join(lines))
    
    print(f"\n✓ Report saved: {output_path}")
    conn.close()

if __name__ == "__main__":
    main()
