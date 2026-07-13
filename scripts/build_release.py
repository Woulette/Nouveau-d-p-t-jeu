#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
VERSION = "1.1.0-foundation.1"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def copy_file(relative: str) -> None:
    source = ROOT / relative
    target = DIST / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)


def main() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)

    for relative in [
        "index.html",
        "styles.css",
        "manifest.webmanifest",
        "sw.js",
        "assets/hero.png",
        "assets/monsters.png",
        "assets/ui.png",
        "assets/effects.png",
        "assets/portrait.png",
        "assets/map-base.png",
        "assets/map-overlay.png",
        "assets/map-data.json",
        "assets/atlas.json",
    ]:
        copy_file(relative)

    game_parts = sorted((ROOT / "src" / "game-parts").glob("*.jsfrag"))
    if not game_parts:
        raise RuntimeError("Sources du moteur absentes")
    target_game = DIST / "src" / "game.js"
    target_game.parent.mkdir(parents=True, exist_ok=True)
    target_game.write_text("".join(path.read_text(encoding="utf-8") for path in game_parts), encoding="utf-8")

    files = []
    for path in sorted(p for p in DIST.rglob("*") if p.is_file()):
        files.append({
            "path": path.relative_to(DIST).as_posix(),
            "bytes": path.stat().st_size,
            "sha256": digest(path),
        })
    report = {
        "version": VERSION,
        "status": "PASS",
        "outputDirectory": "dist",
        "fileCount": len(files),
        "totalBytes": sum(item["bytes"] for item in files),
        "files": files,
    }
    (DIST / "build-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
