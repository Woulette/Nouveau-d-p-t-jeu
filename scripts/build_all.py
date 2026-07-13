#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run(relative: str) -> None:
    subprocess.run([sys.executable, str(ROOT / relative)], cwd=ROOT, check=True)


def main() -> None:
    run("scripts/generate_assets.py")
    run("scripts/audit_assets.py")
    run("scripts/build_release.py")
    run("tests/static_validation.py")


if __name__ == "__main__":
    main()
