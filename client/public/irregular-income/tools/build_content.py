#!/usr/bin/env python3
"""Build the browser content bundle from the editable JSON source files."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
files = {
    "en": ROOT / "content" / "en.json",
    "hi": ROOT / "content" / "hi.json",
    "schemes": ROOT / "content" / "schemes.json",
}
data = {key: json.loads(path.read_text(encoding="utf-8")) for key, path in files.items()}
output = "window.ARTHSETU_CONTENT = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
(ROOT / "content.js").write_text(output, encoding="utf-8")
print("Updated content.js from content/en.json, content/hi.json and content/schemes.json")
