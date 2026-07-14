#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    "assets/hero.png", "assets/monsters.png", "assets/ui.png", "assets/effects.png",
    "assets/portrait.png", "assets/map-base.png", "assets/map-overlay.png",
    "assets/map-data.json", "assets/atlas.json",
]
REPORT = ROOT / "tests" / "reproducibility-report.json"


def hashes() -> dict[str, str]:
    return {relative: hashlib.sha256((ROOT / relative).read_bytes()).hexdigest() for relative in TARGETS}


def main() -> None:
    subprocess.run([sys.executable, str(ROOT / "scripts/generate_assets.py")], cwd=ROOT, check=True)
    first = hashes()
    subprocess.run([sys.executable, str(ROOT / "scripts/generate_assets.py")], cwd=ROOT, check=True)
    second = hashes()
    changed = [name for name in TARGETS if first[name] != second[name]]
    report = {
        "version": "1.2.0-alpha.1",
        "status": "PASS" if not changed else "FAIL",
        "generatedFiles": len(TARGETS),
        "changed": changed,
        "hashes": second,
    }
    payload = json.dumps(report, indent=2)
    REPORT.write_text(payload, encoding="utf-8")
    (ROOT / "docs" / "REPRODUCIBILITY.json").write_text(payload + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    if changed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
