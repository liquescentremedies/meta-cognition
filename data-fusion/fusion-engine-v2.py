#!/usr/bin/env python3
"""
Data Fusion Engine v2
Unifies ALL conversation data from multiple sources
Properly extracts full message content for deep analysis
"""

import json
import sqlite3
from pathlib import Path
from datetime import datetime
from collections import Counter, defaultdict
import re

# Paths
CLaude_PATH = "/home/workspace/claude/source/extracted/conversations.json"
CHATGPT_PATH = "/home/workspace/Data/conversations.json"
FUSION_DB = "/home/workspace/meta-cognition/data-fusion/fused_cognition.db"

# Deep keywords to search in ALL message content
AUDHD_KEYWORDS = [
    "task", "plan", "remember", "organize", "organise", "executive",
    "overwhelm", "scattered", "remind", "schedule", "hyperfocus",
    "special interest", "rabbit hole", "distracted", "focus",
    "adhd", "autism", "autistic", "neurodivergent", "neurodiverse",
    "automation", "script", "workflow", "system", "framework"
]

def init_db():
    conn = sqlite3.connect(FUSION_DB)
    conn.executescript("""
        DROP TABLE IF EXISTS conversations;
        DROP TABLE IF EXISTS messages;
        DROP TABLE IF EXISTS keyword_index;
        
        CREATE TABLE conversations (
            id INTEGER PRIMARY KEY,
            source TEXT,
            conversation_id TEXT,
            title TEXT,
            timestamp TEXT,
            model TEXT,
            message_count INTEGER,
            url TEXT
        );
        
        CREATE TABLE messages (
            id INTEGER PRIMARY KEY,
            conv_id INTEGER,
            sender TEXT,
            content TEXT,
            timestamp TEXT,
            FOREIGN KEY (conv_id) REFERENCES conversations(id)
        );
        
        CREATE TABLE keyword_index (
            keyword TEXT,
            conv_id INTEGER,
            count INTEGER,
            FOREIGN KEY (conv_id) REFERENCES conversations(id)
        );
        
        CREATE INDEX idx_conv_source ON conversations(source);
        CREATE INDEX idx_msg_sender ON messages(sender);
        CREATE INDEX idx_keyword ON keyword_index(keyword);
    """)
    conn.commit()
    return conn

def extract_all_content(messages_list):
    """Extract ALL text content from messages for deep analysis."""
    full_text = []
    
    for msg in messages_list:
        # Handle different message structures
        content = ""
        
        # Try various content locations
        if isinstance(msg, dict):
            # Direct text
            if isinstance(msg.get("text"), str):
                content = msg["text"]
            # Content array
            elif isinstance(msg.get("content"), list):
                for block in msg["content"]:
                    if isinstance(block, dict):
                        if block.get("type") == "text":
                            text_val = block.get("text", "")
                            if isinstance(text_val, str):
                                content += text_val + " "
            # String content
            elif isinstance(msg.get("content"), str):
                content = msg["content"]
            
            # ChatGPT mapping format
            if not content and "message" in msg:
                inner = msg["message"]
                if isinstance(inner, dict):
                    c = inner.get("content", {})
                    if isinstance(c, dict):
                        parts = c.get("parts", [])
                        if parts and isinstance(parts[0], str):
                            content = parts[0]
        
        if content and isinstance(content, str):
            full_text.append(content)
    
    return " ".join(full_text)

def count_keywords(text):
    """Count keyword occurrences in text."""
    text_lower = text.lower()
    counts = {}
    for kw in AUDHD_KEYWORDS:
        # Match whole words or substrings
        pattern = r'\b' + re.escape(kw) + r'\b'
        count = len(re.findall(pattern, text_lower))
        if count > 0:
            counts[kw] = count
    return counts

def load_claude_data():
    """Load Claude conversations with full message extraction."""
    print(f"Loading Claude data from {CLaude_PATH}...")
    
    with open(CLaude_PATH, 'r') as f:
        conversations = json.load(f)
    
    conn = sqlite3.connect(FUSION_DB)
    stats = {"conversations": 0, "messages": 0, "keywords": Counter()}
    
    for conv in conversations:
        messages = conv.get("chat_messages", [])
        if not messages:
            continue
        
        # Insert conversation
        cursor = conn.execute("""
            INSERT INTO conversations 
            (source, conversation_id, title, timestamp, model, message_count, url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "claude",
            conv.get("uuid", ""),
            conv.get("name", ""),
            conv.get("created_at", ""),
            "",
            len(messages),
            f"https://claude.ai/chat/{conv.get('uuid', '')}"
        ))
        conv_db_id = cursor.lastrowid
        
        # Extract and store all messages
        full_text = []
        for msg in messages:
            sender = msg.get("sender", "unknown")
            content = extract_all_content([msg])
            
            if content:
                conn.execute("""
                    INSERT INTO messages (conv_id, sender, content, timestamp)
                    VALUES (?, ?, ?, ?)
                """, (conv_db_id, sender, content, msg.get("created_at", "")))
                full_text.append(content)
                stats["messages"] += 1
        
        # Index keywords
        combined_text = " ".join(full_text)
        kw_counts = count_keywords(combined_text)
        for kw, count in kw_counts.items():
            conn.execute("""
                INSERT INTO keyword_index (keyword, conv_id, count)
                VALUES (?, ?, ?)
            """, (kw, conv_db_id, count))
            stats["keywords"][kw] += count
        
        stats["conversations"] += 1
        if stats["conversations"] % 100 == 0:
            conn.commit()
            print(f"  ...processed {stats['conversations']} conversations")
    
    conn.commit()
    conn.close()
    return stats

def load_chatgpt_data():
    """Load ChatGPT conversations with full message extraction."""
    print(f"Loading ChatGPT data from {CHATGPT_PATH}...")
    
    with open(CHATGPT_PATH, 'r') as f:
        conversations = json.load(f)
    
    conn = sqlite3.connect(FUSION_DB)
    stats = {"conversations": 0, "messages": 0, "keywords": Counter()}
    
    for conv in conversations:
        messages = conv.get("chat_messages", conv.get("mapping", {}))
        
        # Handle mapping format
        if isinstance(messages, dict):
            msg_list = []
            for msg_id, msg_data in messages.items():
                if isinstance(msg_data, dict) and "message" in msg_data:
                    msg_list.append(msg_data["message"])
            messages = msg_list
        
        if not messages:
            continue
        
        # Insert conversation
        cursor = conn.execute("""
            INSERT INTO conversations 
            (source, conversation_id, title, timestamp, model, message_count, url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "chatgpt",
            conv.get("uuid") or conv.get("id", ""),
            conv.get("name") or conv.get("title", ""),
            conv.get("created_at") or conv.get("create_time", ""),
            conv.get("model", ""),
            len(messages) if isinstance(messages, list) else len(messages),
            ""
        ))
        conv_db_id = cursor.lastrowid
        
        # Extract and store all messages
        full_text = []
        for msg in messages if isinstance(messages, list) else []:
            sender = "user" if (msg.get("sender") == "human" or 
                               msg.get("author", {}).get("role") == "user") else "assistant"
            content = extract_all_content([msg])
            
            if content:
                conn.execute("""
                    INSERT INTO messages (conv_id, sender, content, timestamp)
                    VALUES (?, ?, ?, ?)
                """, (conv_db_id, sender, content, msg.get("created_at", "")))
                full_text.append(content)
                stats["messages"] += 1
        
        # Index keywords
        combined_text = " ".join(full_text)
        kw_counts = count_keywords(combined_text)
        for kw, count in kw_counts.items():
            conn.execute("""
                INSERT INTO keyword_index (keyword, conv_id, count)
                VALUES (?, ?, ?)
            """, (kw, conv_db_id, count))
            stats["keywords"][kw] += count
        
        stats["conversations"] += 1
        if stats["conversations"] % 100 == 0:
            conn.commit()
            print(f"  ...processed {stats['conversations']} conversations")
    
    conn.commit()
    conn.close()
    return stats

def generate_report():
    """Generate comprehensive analysis report."""
    conn = sqlite3.connect(FUSION_DB)
    
    print("\n=== FUSION REPORT ===\n")
    
    # Source breakdown
    cursor = conn.execute("SELECT source, COUNT(*) FROM conversations GROUP BY source")
    print("Conversations by source:")
    for row in cursor:
        print(f"  {row[0]}: {row[1]}")
    
    # Total messages
    cursor = conn.execute("SELECT sender, COUNT(*) FROM messages GROUP BY sender")
    print("\nMessages by sender:")
    for row in cursor:
        print(f"  {row[0]}: {row[1]}")
    
    # Top keywords
    cursor = conn.execute("""
        SELECT keyword, SUM(count) as total 
        FROM keyword_index 
        GROUP BY keyword 
        ORDER BY total DESC 
        LIMIT 15
    """)
    print("\nTop AuDHD-related keywords:")
    for row in cursor:
        print(f"  {row[0]}: {row[1]} mentions")
    
    # Conversations with most task/plan activity
    cursor = conn.execute("""
        SELECT c.title, c.source, SUM(k.count) as task_count
        FROM conversations c
        JOIN keyword_index k ON c.id = k.conv_id
        WHERE k.keyword IN ('task', 'plan', 'organize', 'organise', 'executive')
        GROUP BY c.id
        ORDER BY task_count DESC
        LIMIT 10
    """)
    print("\nTop executive function conversations:")
    for row in cursor:
        print(f"  [{row[1]}] {row[0][:60]}... ({row[2]} task/plan mentions)")
    
    conn.close()

def export_ideas():
    """Export high-engagement conversations as ideas."""
    conn = sqlite3.connect(FUSION_DB)
    
    output_path = "/home/workspace/meta-cognition/data-fusion/extracted_ideas_v2.md"
    
    with open(output_path, 'w') as f:
        f.write("# Extracted Ideas from All Conversations (v2)\n\n")
        f.write(f"*Generated: {datetime.now().isoformat()}*\n\n")
        
        # Get conversations with rich content (many messages, keywords)
        cursor = conn.execute("""
            SELECT c.source, c.title, c.timestamp, c.message_count,
                   GROUP_CONCAT(k.keyword || ':' || k.count) as keywords
            FROM conversations c
            LEFT JOIN keyword_index k ON c.id = k.conv_id
            WHERE c.message_count > 5
            GROUP BY c.id
            HAVING keywords IS NOT NULL
            ORDER BY c.message_count DESC
            LIMIT 100
        """)
        
        count = 0
        for row in cursor:
            source, title, timestamp, msg_count, keywords = row
            f.write(f"\n## [{source.upper()}] {title or 'Untitled'}\n\n")
            f.write(f"*Messages: {msg_count} | {timestamp}*\n\n")
            
            # Get first user message as preview
            conv_cursor = conn.execute("""
                SELECT content FROM messages 
                WHERE conv_id = (SELECT id FROM conversations 
                                WHERE title = ? AND source = ? LIMIT 1)
                AND sender = 'user'
                LIMIT 1
            """, (title, source))
            
            preview_row = conv_cursor.fetchone()
            if preview_row:
                preview = preview_row[0][:300] if preview_row[0] else ""
                f.write(f"> {preview}...\n\n")
            
            if keywords:
                f.write(f"*Keywords: {keywords}*\n\n")
            
            f.write("---\n\n")
            count += 1
        
        f.write(f"\n*Total: {count} high-engagement conversations*\n")
    
    conn.close()
    print(f"\n✓ Exported to {output_path}")

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Fusion Engine v2")
    parser.add_argument("--fuse", action="store_true", help="Rebuild fusion database")
    parser.add_argument("--report", action="store_true", help="Generate report")
    parser.add_argument("--export", action="store_true", help="Export ideas")
    args = parser.parse_args()
    
    if args.fuse:
        print("Initializing fusion database...")
        init_db()
        
        print("\nFusing Claude data...")
        claude_stats = load_claude_data()
        print(f"  ✓ {claude_stats['conversations']} conversations, {claude_stats['messages']} messages")
        
        print("\nFusing ChatGPT data...")
        chatgpt_stats = load_chatgpt_data()
        print(f"  ✓ {chatgpt_stats['conversations']} conversations, {chatgpt_stats['messages']} messages")
        
        print("\n✓ Fusion complete!")
    
    if args.report:
        generate_report()
    
    if args.export:
        export_ideas()
    
    if not any([args.fuse, args.report, args.export]):
        parser.print_help()

if __name__ == "__main__":
    main()
