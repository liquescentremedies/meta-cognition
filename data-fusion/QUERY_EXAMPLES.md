# 🔍 Searchable Ideas Database - Query Guide

**Database:** `searchable_ideas.db`  
**Location:** `/home/workspace/meta-cognition/data-fusion/searchable_ideas.db`

---

## 📐 Schema

### Table: `ideas`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Auto-increment ID |
| `type` | TEXT | One of: `concept`, `project`, `accommodation`, `unfinished` |
| `content` | TEXT | The actual idea text (max 1000 chars) |
| `source_conv` | TEXT | Conversation title where idea originated |
| `timestamp` | TEXT | ISO datetime of conversation |
| `keywords` | TEXT | Auto-extracted search keywords |

### Virtual Table: `ideas_fts`

FTS5 full-text search index on `content`, `source_conv`, and `keywords`.

---

## 🔎 Query Examples

### 1. Simple Full-Text Search
```sql
-- Search for ideas containing "ADHD"
SELECT i.type, i.content, i.source_conv
FROM ideas i
JOIN ideas_fts fts ON i.id = fts.rowid
WHERE ideas_fts MATCH 'ADHD'
LIMIT 10;
```

### 2. Search by Type + Content
```sql
-- Find all "project" ideas about "Raspberry Pi"
SELECT content, source_conv, timestamp
FROM ideas
WHERE type = 'project'
  AND id IN (SELECT rowid FROM ideas_fts WHERE ideas_fts MATCH 'Raspberry')
ORDER BY timestamp DESC;
```

### 3. Multi-Term Search (OR)
```sql
-- Search for "neurodivergent" OR "autism" OR "ADHD"
SELECT type, content, source_conv
FROM ideas
WHERE id IN (
    SELECT rowid FROM ideas_fts
    WHERE ideas_fts MATCH 'neurodivergent OR autism OR ADHD'
)
LIMIT 20;
```

### 4. Phrase Search
```sql
-- Exact phrase "executive function"
SELECT content, source_conv
FROM ideas
WHERE id IN (
    SELECT rowid FROM ideas_fts
    WHERE ideas_fts MATCH '"executive function"'
);
```

### 5. Exclude Terms (NOT)
```sql
-- Find "code" ideas but NOT "artifact"
SELECT content, source_conv
FROM ideas
WHERE type = 'concept'
  AND id IN (
    SELECT rowid FROM ideas_fts
    WHERE ideas_fts MATCH 'code NOT artifact'
);
```

### 6. Prefix Search
```sql
-- Find anything starting with "neuro*"
SELECT content, source_conv
FROM ideas
WHERE id IN (
    SELECT rowid FROM ideas_fts
    WHERE ideas_fts MATCH 'neuro*'
);
```

### 7. Get All Unfinished Items
```sql
-- List all unfinished ideas
SELECT content, source_conv, timestamp
FROM ideas
WHERE type = 'unfinished'
ORDER BY timestamp DESC;
```

### 8. Recent Ideas by Conversation
```sql
-- Ideas from specific conversation
SELECT type, content
FROM ideas
WHERE source_conv = 'AI Memory Scrapbook Concept'
ORDER BY type;
```

### 9. Keyword Aggregation
```sql
-- Most common words in concepts
SELECT keywords, COUNT(*) as freq
FROM ideas
WHERE type = 'concept'
GROUP BY keywords
ORDER BY freq DESC
LIMIT 20;
```

### 10. Search with Rank
```sql
-- Ranked search results
SELECT 
    i.type,
    i.content,
    i.source_conv,
    rank
FROM ideas i
JOIN ideas_fts fts ON i.id = fts.rowid
WHERE ideas_fts MATCH 'hyperfocus'
ORDER BY rank
LIMIT 10;
```

---

## 🛠️ CLI Quick Queries

```bash
# Search from command line
duckdb /home/workspace/meta-cognition/data-fusion/searchable_ideas.db -c "
    SELECT type, substr(content, 1, 80) as preview, source_conv 
    FROM ideas 
    WHERE id IN (SELECT rowid FROM ideas_fts WHERE ideas_fts MATCH 'ADHD') 
    LIMIT 5;"

# Count by type
sqlite3 /home/workspace/meta-cognition/data-fusion/searchable_ideas.db "SELECT type, COUNT(*) FROM ideas GROUP BY type;"

# List recent conversations with ideas
sqlite3 /home/workspace/meta-cognition/data-fusion/searchable_ideas.db "
    SELECT DISTINCT source_conv, timestamp, 
           (SELECT COUNT(*) FROM ideas i2 WHERE i2.source_conv = i1.source_conv) as idea_count
    FROM ideas i1 
    ORDER BY timestamp DESC 
    LIMIT 10;"
```

---

## 📊 Current Stats

| Type | Count |
|------|-------|
| concept | 100 |
| project | 60 |
| accommodation | 60 |
| **Total** | **220** |

---

## 🔧 Python Usage

```python
import sqlite3

conn = sqlite3.connect('/home/workspace/meta-cognition/data-fusion/searchable_ideas.db')
cursor = conn.cursor()

# Full-text search
cursor.execute("""
    SELECT type, content, source_conv 
    FROM ideas 
    WHERE id IN (SELECT rowid FROM ideas_fts WHERE ideas_fts MATCH ?)
    LIMIT 10
"", ('neurodivergent',))

for row in cursor.fetchall():
    print(f"[{row[0]}] {row[1][:80]}... (from: {row[2]})")

conn.close()
```

---

*Generated: 2026-03-06*
*Source: extracted_ideas_actual.md*
