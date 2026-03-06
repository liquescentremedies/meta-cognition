#!/usr/bin/env python3
import json
import sqlite3
import re

conn = sqlite3.connect('/home/workspace/meta-cognition/data-fusion/fused_cognition.db')
cursor = conn.cursor()

artifacts_found = []

for row in cursor.execute("SELECT id, source, conversation_id, title, timestamp FROM conversations"):
    conv_id, source, conv_uuid, title, timestamp = row
    
    cursor2 = conn.cursor()
    for msg_row in cursor2.execute("SELECT sender, content FROM messages WHERE conv_id = ?", (conv_id,)):
        sender, content = msg_row
        if not content:
            continue
        
        code_blocks = re.findall(r'```(\w+)?\n(.*?)```', content, re.DOTALL)
        for lang, code in code_blocks:
            if len(code) > 100:
                artifacts_found.append({
                    'conversation': title,
                    'source': source,
                    'language': lang or 'plaintext',
                    'code_preview': code[:500] + ('...' if len(code) > 500 else ''),
                    'timestamp': timestamp
                })

print(f"Found {len(artifacts_found)} code artifacts")

with open('/home/workspace/meta-cognition/data-fusion/extracted_code_artifacts.json', 'w') as f:
    json.dump(artifacts_found, f, indent=2)

print("Saved to extracted_code_artifacts.json")
conn.close()
