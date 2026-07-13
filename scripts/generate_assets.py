#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PARTS = ROOT / "scripts" / "assetgen-parts"
source = "".join(path.read_text(encoding="utf-8") for path in sorted(PARTS.glob("*.pyfrag")))
if not source.strip():
    raise RuntimeError("Sources du générateur d'assets absentes")
namespace = {"__name__": "__main__", "__file__": str(Path(__file__).resolve())}
exec(compile(source, str(PARTS / "combined.py"), "exec"), namespace)
