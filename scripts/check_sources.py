#!/usr/bin/env python3
from __future__ import annotations
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parts = sorted((ROOT / "src" / "game-parts").glob("*.jsfrag"))
if not parts:
    raise SystemExit("Sources JavaScript absentes")
with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as handle:
    handle.write("".join(path.read_text(encoding="utf-8") for path in parts))
    temp = Path(handle.name)
try:
    subprocess.run(["node", "--check", str(temp)], check=True)
    for script in (ROOT / "scripts").glob("*.py"):
        subprocess.run([sys.executable, "-m", "py_compile", str(script)], check=True)
    for script in (ROOT / "tests").glob("*.py"):
        subprocess.run([sys.executable, "-m", "py_compile", str(script)], check=True)
finally:
    temp.unlink(missing_ok=True)
print("Sources valides")
