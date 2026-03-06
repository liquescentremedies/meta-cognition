#!/usr/bin/env python3
"""
Batch Transcription Agent
Pro
[truncated]	e_all():
    """Main entry point."""
    
    # Get list of voice files
    voice_files = list(VOICE_DIR.glob("*.wav"))
    print(f"🎙️  Found {len(voice_files)} voice files")
    
    # Load progress
    progress = load_progress()
    completed = set(progress.get("completed", []))
    
    # Filter out completed
    remaining = [f for f in voice_files if f.stem not in completed]
    print(f"   {len(completed)} already transcribed")
    print(f"   {len(remaining)} remaining")
    
    if not remaining:
        print("\n✓ All files transcribed!")
        print(f"   Database: {DB_PATH}")
        print(f"   Run 'python3 batch-transcribe.py --export' to export to fusion")
        return
    
    # Process remaining
    results = process_batch(remaining)
    
    # Save to database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    new_count = 0
    for r in results:
        cursor.execute("""
            INSERT OR REPLACE INTO transcripts 
            (file_id, filename, transcript_text, duration, word_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            r["file_id"],
            r["filename"],
            r["transcript"],
            r["duration"],
            r["word_count"],
            datetime.now().isoformat()
        ))
        new_count += 1
    
    conn.commit()
    conn.close()
    
    # Update progress
    progress["completed"].extend([r["file_id"] for r in results])
    progress["total_processed"] = len(progress["completed"])
    save_progress(progress)
    
    print(f"\n✓ Transcription complete!")
    print(f"   New transcripts: {new_count}")
    print(f"   Total complete: {len(progress['completed'])}/{len(voice_files)}")
    print(f"   Database: {DB_PATH}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--export":
        export_to_fusion()
    elif len(sys.argv) > 1 and sys.argv[1] == "--report":
        generate_report()
    else:
        transcribe_all()
