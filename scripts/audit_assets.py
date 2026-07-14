#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
REPORT = ROOT / "docs" / "ASSET_AUDIT.json"

EXPECTED = {
    "hero.png": (1184, 192),
    "monsters.png": (1104, 336),
    "ui.png": (576, 48),
    "effects.png": (1536, 48),
    "portrait.png": (96, 96),
    "map-base.png": (2048, 1280),
    "map-overlay.png": (2048, 1280),
}
TEXT = ["atlas.json", "map-data.json"]


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> None:
    errors: list[str] = []
    files: list[dict[str, object]] = []
    for name, expected_size in EXPECTED.items():
        path = ASSETS / name
        if not path.exists():
            errors.append(f"asset absent: {name}")
            continue
        with Image.open(path) as image:
            image.load()
            size = image.size
            mode = image.mode
            extrema = image.convert("RGBA").getextrema()
        if size != expected_size:
            errors.append(f"dimensions inattendues pour {name}: {size} != {expected_size}")
        if path.stat().st_size < 256:
            errors.append(f"asset anormalement petit: {name}")
        if all(lo == hi for lo, hi in extrema[:3]):
            errors.append(f"asset uniforme: {name}")
        files.append({
            "path": f"assets/{name}",
            "width": size[0],
            "height": size[1],
            "mode": mode,
            "bytes": path.stat().st_size,
            "sha256": digest(path),
        })

    for name in TEXT:
        path = ASSETS / name
        if not path.exists():
            errors.append(f"donnée absente: {name}")
            continue
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:  # noqa: BLE001
            errors.append(f"JSON invalide {name}: {exc}")
        files.append({
            "path": f"assets/{name}",
            "bytes": path.stat().st_size,
            "sha256": digest(path),
        })

    atlas = json.loads((ASSETS / "atlas.json").read_text(encoding="utf-8")) if (ASSETS / "atlas.json").exists() else {}
    map_data = json.loads((ASSETS / "map-data.json").read_text(encoding="utf-8")) if (ASSETS / "map-data.json").exists() else {}
    monster_types = set(atlas.get("monsters", {}).get("types", []))
    blocked = {tuple(tile) for tile in map_data.get("blocked", [])}
    width, height = map_data.get("width", 0), map_data.get("height", 0)
    for spawn in map_data.get("monsterSpawns", []):
        position = (spawn.get("x"), spawn.get("y"))
        if spawn.get("type") not in monster_types:
            errors.append(f"type de spawn sans atlas: {spawn.get('type')}")
        if position in blocked or not (0 <= position[0] < width and 0 <= position[1] < height):
            errors.append(f"spawn de monstre invalide: {spawn}")
    for required_type in {"bear", "treant"}:
        if required_type not in monster_types:
            errors.append(f"famille de monstre absente de l’atlas: {required_type}")
    edge_safe_frames = 0
    monster_type_list = atlas.get("monsters", {}).get("types", [])
    monster_frame = atlas.get("monsters", {}).get("frame", 0)
    monster_path = ASSETS / "monsters.png"
    if monster_path.exists() and monster_frame == 48:
        with Image.open(monster_path) as monster_image:
            alpha = monster_image.convert("RGBA").getchannel("A")
            columns = monster_image.width // monster_frame
            for monster_type in ("bear", "treant"):
                if monster_type not in monster_type_list:
                    continue
                row = monster_type_list.index(monster_type)
                for column in range(columns):
                    frame = alpha.crop((column * 48, row * 48, (column + 1) * 48, (row + 1) * 48))
                    borders = [
                        frame.crop((0, 0, 48, 1)), frame.crop((0, 47, 48, 48)),
                        frame.crop((0, 0, 1, 48)), frame.crop((47, 0, 48, 48)),
                    ]
                    if any(border.getbbox() for border in borders):
                        errors.append(f"frame {monster_type} {column} touche le bord de sa cellule")
                    else:
                        edge_safe_frames += 1
    metrics = {
        "heroAnimationFrames": sum(value[1] for value in atlas.get("hero", {}).get("states", {}).values()) * len(atlas.get("hero", {}).get("dirs", [])),
        "monsterAnimationFrames": sum(value[1] for value in atlas.get("monsters", {}).get("states", {}).values()) * len(atlas.get("monsters", {}).get("types", [])),
        "uiIcons": len(atlas.get("ui", {}).get("names", [])),
        "effectFrames": sum(value[1] for value in atlas.get("effects", {}).get("states", {}).values()),
        "edgeSafeNewMonsterFrames": edge_safe_frames,
    }
    report = {
        "version": "1.2.0-alpha.1",
        "status": "PASS" if not errors else "FAIL",
        "sourceOfTruth": "scripts/generate_assets.py",
        "runtimeFormat": "PNG atlases generated deterministically at build time",
        "files": files,
        "metrics": metrics,
        "errors": errors,
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
