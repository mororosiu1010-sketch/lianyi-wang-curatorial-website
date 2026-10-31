"""Extract unique embedded PDF images for article-asset review."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from pypdf import PdfReader


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    reader = PdfReader(args.source)
    seen: set[str] = set()
    manifest: list[dict[str, object]] = []

    for page_number, page in enumerate(reader.pages, 1):
        for image_number, image_file in enumerate(page.images, 1):
            image = image_file.image
            pixels = image.tobytes()
            fingerprint = hashlib.sha256(
                pixels + str(image.size).encode() + image.mode.encode()
            ).hexdigest()
            duplicate = fingerprint in seen
            filename = f"p{page_number:02d}-{image_number:02d}.png"

            if not duplicate:
                seen.add(fingerprint)
                image.save(args.output / filename, format="PNG", optimize=True)

            manifest.append(
                {
                    "page": page_number,
                    "image": image_number,
                    "source_name": image_file.name,
                    "filename": filename,
                    "width": image.width,
                    "height": image.height,
                    "mode": image.mode,
                    "duplicate": duplicate,
                }
            )

    (args.output / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
