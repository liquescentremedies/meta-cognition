#!/usr/bin/env python3
"""
Spawn parallel agent workers to build the idea cosmos
"""
import requests
import os
import json
from concurrent.futures import ThreadPoolExecutor, as_completed

ZO_TOKEN = os.environ.get("ZO_CLIENT_IDENTITY_TOKEN")
BASE_URL = "https://api.zo.computer"

def spawn_worker(task_name, instructions):
    """Spawn a Zo agent worker via API"""
    response = requests.post(
        f"{BASE_URL}/zo/ask",
        headers={
            "authorization": ZO_TOKEN,
            "content-type": "application/json"
        },
        json={
            "input": instructions,
            "model_name": "vercel:moonshotai/kimi-k2.5"
        }
    )
    result = response.json()
    return {
        "task": task_name,
        "output": result.get("output", "No output"),
        "status": "complete"
    }

# Define worker tasks
workers = [
    {
        "name": "code-archaeologist",
        "instructions": """
You are the Code Archaeologist agent. Your mission: extract ALL code artifacts from conversation data.

DATA LOCATION: /home/workspace/meta-cognition/data-fusion/fused_cognition.db

Your task:
1. Connect to the SQLite database
2. Query all messages with sender='assistant' 
3. Extract code blocks (```language...```)
4. Save each artifact with metadata: conv_title, timestamp, language, code_content
5. Output to: /home/workspace/meta-cognition/data-fusion/code_artifacts.json

Return a summary: how many artifacts found, what languages, top 5 by size.
"""
    },
    {
        "name": "idea-indexer",
        "instructions": """
You are the Idea Indexer agent. Build a searchable vector database of all extracted ideas.

DATA: /home/workspace/meta-cognition/data-fusion/extracted_ideas_actual.md

Your task:
1. Parse the markdown file to extract:
   - Concepts/Intents
   - Projects  
   - Accommodations
   - Unfinished items
2. Create SQLite database: /home/workspace/meta-cognition/data-fusion/searchable_ideas.db
3. Tables: ideas(id, type, content, source_conv, timestamp, keywords)
4. Full-text search index on content
5. Provide query examples

Return: schema and sample queries.
"""
    },
    {
        "name": "project-board-creator",
        "instructions": """
You are the Project Board Creator agent. Transform unfinished items into actionable project boards.

DATA: /home/workspace/meta-cognition/data-fusion/searchable_ideas.db

Your task:
1. Query all 'unfinished' type ideas
2. Categorize by: status (idea/proto/active), domain (tech/creative/life), effort (small/medium/large)
3. Create project board JSON: /home/workspace/meta-cognition/data-fusion/project_boards.json
4. Each project needs: title, description, next_action, blockers, resources_needed

Return: summary of boards created, ready for kanban view.
"""
    },
    {
        "name": "world-builder",
        "instructions": """
You are the World Builder agent. Create the "worlds within worlds" interactive site.

CONCEPT: Ideas as nested fractal scenes. Click to zoom deeper. Easter eggs reveal sub-worlds.

Your task:
1. Read project_boards.json and searchable_ideas.db
2. Design a THREE.js or D3.js visualisation where:
   - Each main idea is a "planet/world"
   - Hover shows preview
   - Click zooms into that world revealing sub-ideas (projects, code, unfinished items)
   - Deeper levels show: code snippets, conversation excerpts, next actions
3. Create: /home/workspace/meta-cognition/interactive-site/index.html
4. Style: dark theme, ADHD-friendly (low motion option), keyboard navigation

Return: file path and how to view it.
"""
    }
]

# Spawn all workers in parallel
print("🌌 SPAWNING IDEA COSMOS WORKERS...")
print("=" * 50)

results = []
with ThreadPoolExecutor(max_workers=4) as executor:
    futures = {
        executor.submit(spawn_worker, w["name"], w["instructions"]): w["name"]
        for w in workers
    }
    
    for future in as_completed(futures):
        name = futures[future]
        try:
            result = future.result()
            results.append(result)
            print(f"\n✅ {result['task']} complete")
            print(f"Output preview: {result['output'][:200]}...")
        except Exception as e:
            print(f"\n❌ {name} failed: {e}")

# Save results
with open('/home/workspace/meta-cognition/orchestrator/worker_results.json', 'w') as f:
    json.dump(results, f, indent=2)

print("\n" + "=" * 50)
print(f"🎯 All {len(results)} workers completed")
print("Results saved to: worker_results.json")
