#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
REPORT = ROOT / "tests" / "static-report.json"
VERSION = "1.1.0-foundation.1"


def main() -> None:
    errors: list[str] = []
    required = [
        "index.html", "styles.css", "src/game.js", "manifest.webmanifest", "sw.js",
        "assets/hero.png", "assets/monsters.png", "assets/ui.png", "assets/effects.png",
        "assets/portrait.png", "assets/map-base.png", "assets/map-overlay.png",
        "assets/map-data.json", "assets/atlas.json",
    ]
    for relative in required:
        path = DIST / relative
        if not path.exists() or path.stat().st_size == 0:
            errors.append(f"sortie absente ou vide: {relative}")

    html = (DIST / "index.html").read_text(encoding="utf-8") if (DIST / "index.html").exists() else ""
    css = (DIST / "styles.css").read_text(encoding="utf-8") if (DIST / "styles.css").exists() else ""
    js = (DIST / "src/game.js").read_text(encoding="utf-8") if (DIST / "src/game.js").exists() else ""
    combined = "\n".join([html, css, js])

    if VERSION not in html or VERSION not in js:
        errors.append("numéro de build incohérent")
    if "/mnt/data" in combined or "file://" in combined:
        errors.append("dépendance vers un chemin temporaire")
    if "🪵" in combined or "🪨" in combined or "🔵" in combined or "🎒" in combined:
        errors.append("emoji utilisé comme asset de jeu")
    if "window.__SOLENNE__" not in js:
        errors.append("API de test du moteur absente")
    for state in ["idle", "walk", "staff", "sling", "cast", "hit", "death"]:
        if not re.search(rf"['\"]{state}['\"]", js):
            errors.append(f"état d'animation absent: {state}")
    for rule in ["generalXpNeeded", "classXpNeeded", "masteryXpNeeded", "playerSpeed"]:
        if rule not in js:
            errors.append(f"règle de progression absente: {rule}")

    report = {
        "version": VERSION,
        "status": "PASS" if not errors else "FAIL",
        "requiredFiles": len(required),
        "htmlBytes": len(html.encode()),
        "cssBytes": len(css.encode()),
        "javascriptBytes": len(js.encode()),
        "errors": errors,
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
