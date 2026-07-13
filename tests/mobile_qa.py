#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path

try:
    from PIL import Image
    from playwright.async_api import async_playwright
except ImportError as exc:
    raise SystemExit("Installer les dépendances de développement : pip install Pillow playwright") from exc

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
OUT = ROOT / "tests" / "output"
OUT.mkdir(parents=True, exist_ok=True)
VIEWPORTS = [(667, 375), (844, 390), (896, 414), (932, 430)]


async def run() -> None:
    configured_browser = os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE")
    system_browser = Path("/usr/bin/chromium")
    browser_executable = configured_browser or (str(system_browser) if system_browser.exists() else None)
    report = {
        "version": "1.1.0-foundation.1",
        "status": "PASS",
        "browserExecutable": browser_executable or "playwright-managed",
        "viewports": [],
        "errors": [],
    }
    async with async_playwright() as playwright:
        launch_options: dict[str, object] = {"headless": True, "args": ["--no-sandbox"]}
        if browser_executable:
            launch_options["executable_path"] = browser_executable
        browser = await playwright.chromium.launch(**launch_options)
        standalone = DIST / "standalone.html"
        if not standalone.exists():
            raise RuntimeError("dist/standalone.html absent : exécuter npm run build:standalone")
        html = standalone.read_text(encoding="utf-8")
        for width, height in VIEWPORTS:
            page = await browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
            errors: list[str] = []
            page.on("pageerror", lambda error, errors=errors: errors.append(f"pageerror:{error}"))
            page.on("console", lambda message, errors=errors: errors.append(f"console:{message.type}:{message.text}") if message.type == "error" else None)
            await page.set_content(html, wait_until="load")
            await page.wait_for_function("window.__SOLENNE__ && window.__SOLENNE__.snapshot().ready === true", timeout=20_000)
            await page.wait_for_timeout(500)
            shot = OUT / f"foundation-{width}x{height}.png"
            await page.screenshot(path=str(shot))
            image = Image.open(shot).convert("RGB")
            pixels = [image.getpixel((x, y)) for x in range(30, width, max(1, width // 15)) for y in range(30, height, max(1, height // 10))]
            unique = len(set(pixels))
            if errors or unique < 24:
                report["status"] = "FAIL"
            report["viewports"].append({"width": width, "height": height, "uniqueSampleColors": unique, "errors": errors})
            report["errors"].extend(errors)
            await page.close()
        await browser.close()
    (ROOT / "tests" / "mobile-qa-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if report["status"] != "PASS":
        raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(run())
