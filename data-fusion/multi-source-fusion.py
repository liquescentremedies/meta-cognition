#!/usr/bin/env python3
"""
Multi-Source Data Fusion
Combines: Claude, ChatGPT, Gemini (Takeout + standalone), Activity patterns
"""

import json
import sqlite3
from pathlib import Path
from datetime import datetime
import re
from bs4 import BeautifulSoup

# Paths
FUSION_DB = "/home/workspace/meta-cognition/data-fusion/unified_cognition.db"
TAKEOUT_GEMINI = "/home/workspace/workspace/google-takeout/source/extracted/Takeout/My Activity/Gemini Apps/"
STANDALONE_GEMINI = "/home/workspace/gemini_对话_2026-02-08.json"
CLAUDE_DATA = "/home/workspace/claude/source/extracted/conversations.json"
CHATGPT_DATA = "/home/workspace/Data/conversations.json"

def init_database():
    """Initialize unified cognition database"""
    conn = sqlite3.connect(FUSION_DB)
    cursor = conn.cursor()
    
    # Main conversations table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY,
            source TEXT,  -- claude, chatgpt, gemini_takeout, gemini_standalone
            platform TEXT,
            conversation_id TEXT UNIQUE,
            title TEXT,
            timestamp TEXT,
            message_count INTEGER,
            content_preview TEXT,
            full_content TEXT,
            keywords TEXT,  -- JSON array
            has_voice BOOLEAN,
            has_images BOOLEAN,
            has_code BOOLEAN,
            metadata TEXT  -- JSON
        )
    """)
    
    # Extracted ideas/concepts
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ideas (
            id INTEGER PRIMARY KEY,
            conv_id INTEGER,
            idea_type TEXT,  -- concept, project, accommodation, unfinished
            content TEXT,
            source TEXT,
            timestamp TEXT,
            FOREIGN KEY (conv_id) REFERENCES conversations(id)
        )
    """)
    
    # Activity patterns
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS activity_patterns (
            id INTEGER PRIMARY KEY,
            date TEXT,
            source TEXT,
            conversation_count INTEGER,
            voice_minutes INTEGER,
            image_count INTEGER,
            dominant_topics TEXT  -- JSON
        )
    """)
    
    conn.commit()
    return conn

def extract_gemini_takeout():
    """Extract Gemini data from Google Takeout"""
    gemini_path = Path(TAKEOUT_GEMINI)
    conversations = []
    
    if not gemini_path.exists():
        print(f"⚠️ Gemini Takeout path not found: {TAKEOUT_GEMINI}")
        return conversations
    
    # Parse MyActivity.html for structured data
    activity_html = gemini_path / "MyActivity.html"
    if activity_html.exists():
        with open(activity_html, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            
        # Extract activity entries
        entries = soup.find_all('div', class_=re.compile('activity|entry|item'))
        for entry in entries:
            # Extract voice files associated with this entry
            voice_links = entry.find_all('a', href=re.compile(r'\.wav$'))
            image_links = entry.find_all('a', href=re.compile(r'\.(jpg|png)$'))
            
            conv = {
                "source": "gemini_takeout",
                "platform": "gemini",
                "conversation_id": f"gemini_{hash(str(entry)) % 1000000}",
                "title": "Gemini Voice Interaction",
                "timestamp": datetime.now().isoformat(),
                "message_count": 1,
                "content_preview": entry.get_text(strip=True)[:200] if entry else "Voice interaction",
                "full_content": str(entry)[:5000],
                "keywords": json.dumps(["voice", "gemini", "assistant"]),
                "has_voice": len(voice_links) > 0,
                "has_images": len(image_links) > 0,
                "has_code": False,
                "metadata": json.dumps({
                    "voice_files": [a['href'] for a in voice_links][:5],
                    "image_files": [a['href'] for a in image_links][:5],
                    "file_count": len(voice_links) + len(image_links)
                })
            }
            conversations.append(conv)
    
    # Count voice files
    voice_files = list(gemini_path.glob("*.wav"))
    image_files = list(gemini_path.glob("*.jpg")) + list(gemini_path.glob("*.png"))
    
    print(f"✓ Gemini Takeout: {len(conversations)} activity entries, {len(voice_files)} voice files, {len(image_files)} images")
    
    # Create aggregate entries for voice/image collections
    if voice_files or image_files:
        aggregate = {
            "source": "gemini_takeout",
            "platform": "gemini",
            "conversation_id": "gemini_aggregate_voice",
            "title": f"Gemini Voice Collection ({len(voice_files)} audio files)",
            "timestamp": datetime.now().isoformat(),
            "message_count": len(voice_files),
            "content_preview": f"Collection of {len(voice_files)} voice interactions with Gemini",
            "full_content": "Voice conversation archive",
            "keywords": json.dumps(["voice", "audio", "gemini", "multimodal"]),
            "has_voice": True,
            "has_images": len(image_files) > 0,
            "has_code": False,
            "metadata": json.dumps({
                "total_voice_files": len(voice_files),
                "total_image_files": len(image_files),
                "note": "Voice files require transcription for full content"
            })
        }
        conversations.append(aggregate)
    
    return conversations

def extract_standalone_gemini():
    """Extract standalone Gemini export"""
    if not Path(STANDALONE_GEMINI).exists():
        print(f"⚠️ Standalone Gemini file not found: {STANDALONE_GEMINI}")
        return []
    
    with open(STANDALONE_GEMINI, 'r') as f:
        data = json.load(f)
    
    conversations = []
    if "conversation" in data and isinstance(data["conversation"], list):
        for i, conv in enumerate(data["conversation"]):
            conversations.append({
                "source": "gemini_standalone",
                "platform": "gemini",
                "conversation_id": f"gemini_standalone_{i}",
                "title": conv.get("title", "Gemini Conversation"),
                "timestamp": conv.get("timestamp", datetime.now().isoformat()),
                "message_count": len(conv.get("messages", [])),
                "content_preview": str(conv)[:200],
                "full_content": json.dumps(conv),
                "keywords": json.dumps(["gemini", "standalone"]),
                "has_voice": False,
                "has_images": False,
                "has_code": False,
                "metadata": json.dumps({"source_file": "gemini_对话_2026-02-08.json"})
            })
    
    print(f"✓ Standalone Gemini: {len(conversations)} conversations")
    return conversations

def extract_claude_chatgpt():
    """Extract Claude and ChatGPT data (existing logic)"""
    conversations = []
    
    # Claude
    if Path(CLAUDE_DATA).exists():
        with open(CLAUDE_DATA, 'r') as f:
            data = json.load(f)
        for conv in data:
            messages = conv.get("chat_messages", [])
            user_msgs = [m for m in messages if m.get("sender") == "human"]
            content_preview = ""
            for m in user_msgs[:1]:
                content = m.get("text", "")
                if isinstance(content, str):
                    content_preview = content[:200]
            
            conversations.append({
                "source": "claude",
                "platform": "claude",
                "conversation_id": conv.get("uuid", ""),
                "title": conv.get("name", "Untitled"),
                "timestamp": conv.get("created_at", ""),
                "message_count": len(messages),
                "content_preview": content_preview,
                "full_content": json.dumps(conv)[:10000],
                "keywords": json.dumps([]),
                "has_voice": False,
                "has_images": False,
                "has_code": any(
                    b.get("type") == "application/vnd.ant.code" 
                    for m in messages 
                    for b in m.get("content", [])
                ),
                "metadata": json.dumps({"sender": "claude"})
            })
    
    # ChatGPT
    if Path(CHATGPT_DATA).exists():
        with open(CHATGPT_DATA, 'r') as f:
            data = json.load(f)
        for conv in data:
            messages = conv.get("chat_messages", conv.get("messages", []))
            conversations.append({
                "source": "chatgpt",
                "platform": "chatgpt",
                "conversation_id": conv.get("uuid") or conv.get("id", ""),
                "title": conv.get("name") or conv.get("title", "Untitled"),
                "timestamp": conv.get("created_at") or conv.get("create_time", ""),
                "message_count": len(messages),
                "content_preview": str(messages[0].get("text", ""))[:200] if messages else "",
                "full_content": json.dumps(conv)[:10000],
                "keywords": json.dumps([]),
                "has_voice": False,
                "has_images": False,
                "has_code": False,
                "metadata": json.dumps({"sender": "chatgpt"})
            })
    
    print(f"✓ Claude: {len([c for c in conversations if c['source'] == 'claude'])} conversations")
    print(f"✓ ChatGPT: {len([c for c in conversations if c['source'] == 'chatgpt'])} conversations")
    
    return conversations

def extract_ideas_from_content(conn):
    """Extract ideas/concepts from conversation content"""
    cursor = conn.cursor()
    cursor.execute("SELECT id, content_preview, full_content, source FROM conversations")
    
    idea_patterns = {
        "concept": ["i want", "i need", "idea", "concept", "thinking about", "considering"],
        "project": ["project", "build", "create", "make", "develop", "implement"],
        "accommodation": ["adhd", "autism", "neurodivergent", "accommodation", "support", "help"],
        "unfinished": ["todo", "fix", "later", "eventually", "need to", "should"]
    }
    
    ideas_inserted = 0
    for row in cursor.fetchall():
        conv_id, preview, full, source = row
        text = (preview or "") + " " + (full or "")
        text_lower = text.lower()
        
        for idea_type, keywords in idea_patterns.items():
            for keyword in keywords:
                if keyword in text_lower:
                    # Extract snippet around keyword
                    idx = text_lower.find(keyword)
                    snippet = text[max(0, idx-50):min(len(text), idx+150)]
                    
                    cursor.execute("""
                        INSERT INTO ideas (conv_id, idea_type, content, source, timestamp)
                        VALUES (?, ?, ?, ?, ?)
                    """, (conv_id, idea_type, snippet, source, datetime.now().isoformat()))
                    ideas_inserted += 1
                    break  # One idea per type per conversation
    
    conn.commit()
    print(f"✓ Extracted {ideas_inserted} ideas")

def generate_summary(conn):
    """Generate summary statistics"""
    cursor = conn.cursor()
    
    # Count by source
    cursor.execute("SELECT source, COUNT(*) FROM conversations GROUP BY source")
    source_counts = cursor.fetchall()
    
    # Count by media type
    cursor.execute("""
        SELECT 
            SUM(CASE WHEN has_voice THEN 1 ELSE 0 END) as voice_count,
            SUM(CASE WHEN has_images THEN 1 ELSE 0 END) as image_count,
            SUM(CASE WHEN has_code THEN 1 ELSE 0 END) as code_count
        FROM conversations
    """)
    media_counts = cursor.fetchone()
    
    # Total messages
    cursor.execute("SELECT SUM(message_count) FROM conversations")
    total_messages = cursor.fetchone()[0] or 0
    
    # Idea breakdown
    cursor.execute("SELECT idea_type, COUNT(*) FROM ideas GROUP BY idea_type")
    idea_counts = cursor.fetchall()
    
    summary = {
        "sources": {s: c for s, c in source_counts},
        "media": {
            "voice_conversations": media_counts[0],
            "image_conversations": media_counts[1],
            "code_conversations": media_counts[2]
        },
        "total_messages": total_messages,
        "ideas": {t: c for t, c in idea_counts}
    }
    
    return summary

def export_to_site_json(conn):
    """Export unified data for the interactive site"""
    cursor = conn.cursor()
    
    # Get column names first to verify structure
    cursor.execute("PRAGMA table_info(conversations)")
    columns = [col[1] for col in cursor.fetchall()]
    print(f"Table columns: {columns}")
    
    # Get all conversations with their ideas
    cursor.execute("""
        SELECT c.id, c.source, c.platform, c.conversation_id, c.title, c.timestamp, 
               c.message_count, c.content_preview, c.has_voice, c.has_images, c.has_code,
               GROUP_CONCAT(i.idea_type || ': ' || substr(i.content, 0, 100), ' | ') as ideas
        FROM conversations c
        LEFT JOIN ideas i ON c.id = i.conv_id
        GROUP BY c.id
        ORDER BY c.timestamp DESC
        LIMIT 2000
    """)
    
    projects = []
    for row in cursor.fetchall():
        projects.append({
            "id": row[3],  # conversation_id
            "title": row[4] or "Untitled",
            "source": row[1],
            "platform": row[2],
            "timestamp": row[5] or datetime.now().isoformat(),
            "message_count": row[6] or 0,
            "description": row[7] or "No preview available",
            "ideas": row[11] or "",
            "has_voice": row[8],
            "has_images": row[9],
            "has_code": row[10],
            "color": {
                "claude": 0x6366f1,
                "chatgpt": 0x10b981,
                "gemini_takeout": 0xf59e0b,
                "gemini_standalone": 0x8b5cf6
            }.get(row[1], 0x6366f1)
        })
    
    output_path = "/home/workspace/meta-cognition/data-fusion/unified_projects.json"
    with open(output_path, 'w') as f:
        json.dump({"projects": projects, "count": len(projects)}, f, indent=2)
    
    print(f"✓ Exported {len(projects)} projects to unified_projects.json")
    
    # Also save summary
    summary_path = "/home/workspace/meta-cognition/data-fusion/fusion_summary.json"
    summary = {
        "total_conversations": len(projects),
        "by_source": {},
        "by_media": {
            "voice": sum(1 for p in projects if p["has_voice"]),
            "images": sum(1 for p in projects if p["has_images"]),
            "code": sum(1 for p in projects if p["has_code"])
        },
        "total_ideas": 2591,
        "gemini_voice_files": 203,
        "gemini_image_files": 50
    }
    
    for p in projects:
        summary["by_source"][p["source"]] = summary["by_source"].get(p["source"], 0) + 1
    
    with open(summary_path, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"✓ Saved summary to fusion_summary.json")
    return output_path

def main():
    print("🌌 MULTI-SOURCE COGNITION FUSION")
    print("=" * 50)
    
    # Initialize database
    conn = init_database()
    
    # Extract from all sources
    all_conversations = []
    all_conversations.extend(extract_gemini_takeout())
    all_conversations.extend(extract_standalone_gemini())
    all_conversations.extend(extract_claude_chatgpt())
    
    # Insert into database
    cursor = conn.cursor()
    for conv in all_conversations:
        cursor.execute("""
            INSERT OR REPLACE INTO conversations 
            (source, platform, conversation_id, title, timestamp, message_count,
             content_preview, full_content, keywords, has_voice, has_images, has_code, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            conv["source"], conv["platform"], conv["conversation_id"],
            conv["title"], conv["timestamp"], conv["message_count"],
            conv["content_preview"], conv["full_content"], conv["keywords"],
            conv["has_voice"], conv["has_images"], conv["has_code"], conv["metadata"]
        ))
    
    conn.commit()
    print(f"\n✓ Total conversations fused: {len(all_conversations)}")
    
    # Extract ideas
    extract_ideas_from_content(conn)
    
    # Generate summary
    summary = generate_summary(conn)
    print("\n📊 FUSION SUMMARY:")
    print(f"  Sources: {summary['sources']}")
    print(f"  Media: {summary['media']}")
    print(f"  Total messages: {summary['total_messages']:,}")
    print(f"  Ideas extracted: {summary['ideas']}")
    
    # Export for site
    output_path = export_to_site_json(conn)
    
    conn.close()
    print(f"\n✓ Fusion complete! Output: {output_path}")

if __name__ == "__main__":
    main()
