"""Convert the two supplied Chinese article manuscripts into safe HTML fragments."""

from __future__ import annotations

import argparse
from html import escape
from pathlib import Path

from docx import Document


ARTICLE_CONFIG = {
    "p01nt": {
        "label": "PROJECT REVIEW / 2023",
        "skip": {0, 1, 2, 26},
        "headings": set(),
        "notes": {27},
    },
    "crypto-ecosystem": {
        "label": "FIELD NOTE / 2022",
        "skip": {0, 1},
        "headings": {
            "那么问题就变成了加密艺术是什么？",
            "那么我们再看在当代艺术的情景里加密艺术是不是个话题？",
            "是否存在一个“加密艺术生态”？",
        },
        "notes": set(),
    },
}


def inline_html(paragraph) -> str:
    parts: list[str] = []
    for run in paragraph.runs:
        text = escape(run.text)
        if not text:
            continue
        if run.bold:
            text = f"<strong>{text}</strong>"
        if run.italic:
            text = f"<em>{text}</em>"
        parts.append(text)
    rendered = "".join(parts)
    return rendered or escape(paragraph.text)


def convert(source: Path, output: Path, article_type: str) -> None:
    config = ARTICLE_CONFIG[article_type]
    document = Document(source)
    blocks = [f"<h2>{config['label']}</h2>"]

    for index, paragraph in enumerate(document.paragraphs):
        plain_text = paragraph.text.strip()
        if not plain_text or index in config["skip"]:
            continue
        rendered = inline_html(paragraph).strip()
        if plain_text in config["headings"]:
            blocks.append(f"<h2>{rendered}</h2>")
        elif index in config["notes"]:
            blocks.append(f'<p class="article-note">{rendered}</p>')
        else:
            blocks.append(f"<p>{rendered}</p>")

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(blocks) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("article_type", choices=ARTICLE_CONFIG)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    convert(args.source, args.output, args.article_type)


if __name__ == "__main__":
    main()
