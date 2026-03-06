#!/usr/bin/env python3
"""Data Fusion Engine - Unifies conversation data from multiple sources"""

import json
import sqlite3
from pathlib import Path
from datetime import datetime
import argparse

FUSION_DB = "/home/workspace/meta-cognition/data-fusion/fused_cognition.db"

def init_db():
    conn = sqlite3.connect(FUSION_DB)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL,
            conversation_id TEXT,
            title TEXT,
            timestamp TEXT,
            model TEXT,
            message_count INTEGER,
            content_preview TEXT
        )
    """)
    conn.commit()
    conn.close()

def insert_conversation(conn, data):
    conn.execute("""
        INSERT INTO conversations 
        (source, conversation_id, title, timestamp, model, message_count, content_preview)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        data["source"], data["conversation_id"], data["title"],
        data["timestamp"], data["model"], data["message_count"], data["content_preview"]
    ))

def load_chatgpt_data(path):
    print(f"Loading ChatGPT data from {path}...")
    with open(path, 'r') as f:
        conversations = json.load(f)
    
    conn = sqlite3.connect(FUSION_DB)
    count = 0
    for conv in conversations:
        messages = conv.get("mapping", {})
        message_count = len(messages)
        
        content_prev = ""
        for msg_id, msg_data in list(messages.items())[:3]:
            msg = msg_data.get("message", {})
            if msg.get("author", {}).get("role") == "user":
                content = msg.get("content", {})
                if isinstance(content, dict):
                    parts = content.get("parts", [])
                    if parts:
                        content_prev = str(parts[0])[:200]
                break
        
        insert_conversation(conn, {
            "source": "chatgpt",
            "conversation_id": conv.get("id", ""),
            "title": conv.get("title", ""),
            "timestamp": conv.get("create_time"),
            "model": conv.get("model", ""),
            "message_count": message_count,
            "content_preview": content_prev
        })
        count += 1
        if count % 100 == 0:
            conn.commit()
    
    conn.commit()
    conn.close()
    return count

def load_claude_data(path):
    print(f"Loading Claude data from {path}...")
    with open(path, 'r') as f:
        conversations = json.load(f)
    
    conn = sqlite3.connect(FUSION_DB)
    count = 0
    for conv in conversations:
        messages = conv.get("chat_messages", [])
        content_prev = ""
        for msg in messages:
            if msg.get("sender") == "human":
                content = msg.get("text", "")
                if isinstance(content, str):
                    content_prev = content[:200]
                break
        
        insert_conversation(conn, {
            "source": "claude",
            "conversation_id": conv.get("uuid", ""),
            "title": conv.get("name", ""),
            "timestamp": conv.get("created_at"),
            "model": "claude",
            "message_count": len(messages),
            "content_preview": content_prev
        })
        count += 1
        if count % 100 == 0:
            conn.commit()
    
    conn.commit()
    conn.close()
    return count

def fuse_all_data():
    init_db()
    stats = {}
    
    chatgpt_path = Path("/home/workspace/Data/conversations.json")
    if chatgpt_path.exists():
        stats["chatgpt"] = load_chatgpt_data(chatgpt_path)
    else:
        print(f"ChatGPT data not found")
        stats["chatgpt"] = 0
    
    claude_path = Path("/home/workspace/claude/source/extracted/conversations.json")
    if claude_path.exists():
        stats["claude"] = load_claude_data(claude_path)
    else:
        print(f"Claude data not found")
        stats["claude"] = 0
    
    return stats

def analyze_patterns():
    conn = sqlite3.connect(FUSION_DB)
    
    cursor = conn.execute("SELECT source, COUNT(*) FROM conversations GROUP BY source")
    print("\n📊 Conversations by source:")
    for row in cursor:
        print(f"  {row[0]}: {row[1]}")
    
    keywords = ["task", "plan", "remember", "overwhelm", "hyperfocus", "automation", "script"]
    print("\n🔑 Keyword mentions:")
    for kw in keywords:
        cursor = conn.execute(
            "SELECT COUNT(*) FROM conversations WHERE content_preview LIKE ?",
            (f"%{kw}%",)
        )
        count = cursor.fetchone()[0]
        print(f"  {kw}: {count}")
    
    conn.close()

def export_ideas():
    conn = sqlite3.connect(FUSION_DB)
    cursor = conn.execute("""
        SELECT source, title, content_preview, timestamp
        FROM conversations
        WHERE LENGTH(content_preview) > 100
        ORDER BY LENGTH(content_preview) DESC
        LIMIT 50
    """)
    
    ideas = cursor.fetchall()
    
    output_path = Path("/home/workspace/meta-cognition/data-fusion/extracted_ideas.md")
    with open(output_path, 'w') as f:
        f.write("# Extracted Ideas from All Conversations\n\n")
        f.write(f"*Generated: {datetime.now().isoformat()}*\n\n")
        f.write(f"*Total: {len(ideas)} high-engagement conversations*\n\n")
        
        for idea in ideas:
            source, title, preview, timestamp = idea
            f.write(f"## [{source.upper()}] {title}\n\n")
            f.write(f"*{timestamp}*\n\n")
            f.write(f"> {preview}\n\n")
            f.write("---\n\n")
    
    print(f"\n✓ Exported to {output_path}")
    conn.close()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--fuse", action="store_true")
    parser.add_argument("--analyze", action="store_true")
    parser.add_argument("--export-ideas", action="store_true")
    args = parser.parse_args()
    
    if args.fuse:
        stats = fuse_all_data()
        print("\n✓ Fusion complete:")
        for source, count in stats.items():
            print(f"  {source}: {count} conversations")
    elif args.analyze:
        analyze_patterns()
    elif args.export_ideas:
        export_ideas()
    else:
        print("Usage: --fuse | --analyze | --export-ideas")

if __name__ == "__main__":
    main()
