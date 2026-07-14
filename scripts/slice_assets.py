from __future__ import annotations

from collections import deque
from dataclasses import asdict, dataclass
from hashlib import sha256
from pathlib import Path
import json
import shutil

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "official" / "assets" / "generated"
OUTPUT = ROOT / "official" / "assets" / "slices"


@dataclass
class SpriteInfo:
    id: str
    category: str
    file: str
    source: str
    source_box: list[int]
    width: int
    height: int
    opaque_pixels: int
    sha256: str


def connected_boxes(image: Image.Image) -> list[tuple[int, int, int, int]]:
    alpha = image.getchannel("A")
    # Relie les différentes parties d'un même sprite sans fusionner les cellules voisines.
    mask = alpha.point(lambda a: 255 if a > 5 else 0).filter(ImageFilter.MaxFilter(5))
    width, height = mask.size
    pixels = mask.load()
    visited = bytearray(width * height)
    boxes: list[tuple[int, int, int, int]] = []

    for y in range(height):
        for x in range(width):
            index = y * width + x
            if visited[index] or pixels[x, y] == 0:
                continue
            queue = deque([(x, y)])
            visited[index] = 1
            min_x = max_x = x
            min_y = max_y = y
            count = 0
            while queue:
                cx, cy = queue.popleft()
                count += 1
                min_x = min(min_x, cx)
                max_x = max(max_x, cx)
                min_y = min(min_y, cy)
                max_y = max(max_y, cy)
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        continue
                    ni = ny * width + nx
                    if not visited[ni] and pixels[nx, ny] != 0:
                        visited[ni] = 1
                        queue.append((nx, ny))
            if count < 10:
                continue
            left = max(0, min_x - 4)
            top = max(0, min_y - 4)
            right = min(width, max_x + 5)
            bottom = min(height, max_y + 5)
            if right - left >= 6 and bottom - top >= 6:
                boxes.append((left, top, right, bottom))

    boxes.sort(key=lambda box: (box[1] // 8, box[0]))
    return boxes


def make_contact_sheet(category: str, sprites: list[SpriteInfo]) -> None:
    if not sprites:
        return
    cell_w, cell_h = 128, 128
    columns = min(8, max(1, len(sprites)))
    rows = (len(sprites) + columns - 1) // columns
    sheet = Image.new("RGBA", (columns * cell_w, rows * cell_h), (12, 27, 21, 255))
    draw = ImageDraw.Draw(sheet)
    for index, info in enumerate(sprites):
        sprite = Image.open(ROOT / info.file).convert("RGBA")
        scale = min((cell_w - 18) / sprite.width, (cell_h - 30) / sprite.height, 4)
        target = sprite.resize(
            (max(1, round(sprite.width * scale)), max(1, round(sprite.height * scale))),
            Image.Resampling.NEAREST,
        )
        x = (index % columns) * cell_w + (cell_w - target.width) // 2
        y = (index // columns) * cell_h + 4 + (cell_h - 28 - target.height) // 2
        sheet.alpha_composite(target, (x, y))
        draw.text(((index % columns) * cell_w + 5, (index // columns) * cell_h + cell_h - 20), info.id, fill=(255, 227, 154, 255))
    sheet.save(OUTPUT / category / "contact-sheet.png", optimize=True)


def main() -> None:
    sources = {
        "actors": SOURCE / "actors.png",
        "world": SOURCE / "world.png",
        "ui": SOURCE / "ui.png",
    }
    missing = [str(path) for path in sources.values() if not path.exists()]
    if missing:
        raise SystemExit(f"Atlas manquants: {missing}")

    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir(parents=True)

    catalog: list[SpriteInfo] = []
    summary: dict[str, int] = {}

    for category, source_path in sources.items():
        source = Image.open(source_path).convert("RGBA")
        boxes = connected_boxes(source)
        category_dir = OUTPUT / category
        category_dir.mkdir(parents=True)
        category_sprites: list[SpriteInfo] = []

        for index, box in enumerate(boxes, start=1):
            crop = source.crop(box)
            real_box = crop.getbbox()
            if not real_box:
                continue
            crop = crop.crop(real_box)
            alpha = crop.getchannel("A")
            opaque = sum(1 for pixel in alpha.getdata() if pixel > 10)
            if opaque < 18:
                continue
            sprite_id = f"{category}-{index:03d}"
            relative = Path("official/assets/slices") / category / f"{sprite_id}.png"
            destination = ROOT / relative
            crop.save(destination, optimize=True)
            data = destination.read_bytes()
            info = SpriteInfo(
                id=sprite_id,
                category=category,
                file=relative.as_posix(),
                source=source_path.relative_to(ROOT).as_posix(),
                source_box=list(box),
                width=crop.width,
                height=crop.height,
                opaque_pixels=opaque,
                sha256=sha256(data).hexdigest(),
            )
            catalog.append(info)
            category_sprites.append(info)

        summary[category] = len(category_sprites)
        make_contact_sheet(category, category_sprites)

    payload = {
        "version": "0.8.0-art-pass-1",
        "status": "PASS" if all(summary.values()) else "FAIL",
        "summary": summary,
        "sprites": [asdict(item) for item in catalog],
        "note": "Découpage automatique initial. Les identifiants artistiques définitifs seront attribués pendant la refonte.",
    }
    (OUTPUT / "catalog.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if payload["status"] != "PASS":
        raise SystemExit(json.dumps(payload, ensure_ascii=False, indent=2))
    print(json.dumps(payload["summary"], ensure_ascii=False))


if __name__ == "__main__":
    main()
