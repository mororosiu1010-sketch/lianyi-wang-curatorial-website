"""Build the Hong Kong Art Basel article HTML from the saved WeChat PDF."""

from __future__ import annotations

import argparse
from html import escape
from pathlib import Path
import re
import unicodedata

import pdfplumber


RADICALS = str.maketrans(
    {
        "⺠": "民",
        "⻄": "西",
        "⻅": "见",
        "⻆": "角",
        "⻉": "贝",
        "⻓": "长",
        "⻔": "门",
        "⻘": "青",
        "⻚": "页",
        "⻛": "风",
        "⻢": "马",
        "⻨": "麦",
        "⻩": "黄",
    }
)

SECTION_HEADINGS = {
    2: ("before", "1 / 现场"),
    7: ("before", "2 / 是什么奠定了香港的亚洲艺术中心地位？"),
    9: ("after_first", "3 / 一个被誉为艺术中心的城市，它的艺术生态健康吗？"),
    12: ("before", "4 / 艺术巴塞尔进入香港的这十年，如何影响了香港的艺术生态"),
    20: ("after_first", "5 / 香港艺术巴塞尔上有人在讨论艺术吗？"),
}


def clean(text: str) -> str:
    value = unicodedata.normalize("NFKC", text).translate(RADICALS)
    value = value.replace(",", "，").replace("?", "？")
    value = value.replace(" :", "：").replace(":", "：")
    value = re.sub(r"\s+", " ", value).strip()
    return value


def body_paragraphs(page) -> list[str]:
    lines = []
    for line in page.extract_text_lines(strip=True, return_chars=True):
        sizes = {round(char.get("size", 0), 1) for char in line.get("chars", [])}
        if 12.8 not in sizes:
            continue
        lines.append(
            {
                "text": clean(line["text"]),
                "top": float(line["top"]),
                "bottom": float(line["bottom"]),
            }
        )

    paragraphs: list[str] = []
    current = ""
    previous_bottom = None
    for line in lines:
        if previous_bottom is not None and line["top"] - previous_bottom > 20:
            if current:
                paragraphs.append(current)
            current = line["text"]
        else:
            current += line["text"]
        previous_bottom = line["bottom"]
    if current:
        paragraphs.append(current)
    return paragraphs


def is_finished(text: str) -> bool:
    return bool(re.search(r"[。！？!?”’」』）)]$", text))


def paragraph_markup(text: str) -> str:
    return f"<p>{escape(text)}</p>"


def figure(filename: str, caption: str) -> str:
    return (
        f'<figure><img src="@@ASSET_PREFIX@@{escape(filename)}" '
        f'alt="{escape(caption)}" loading="lazy" decoding="async">'
        f'<figcaption>{escape(caption)}</figcaption></figure>'
    )


def figure_group(figures: list[tuple[str, str]]) -> str:
    markup = "".join(figure(filename, caption) for filename, caption in figures)
    return f'<div class="article-image-grid">{markup}</div>' if len(figures) > 1 else markup


def insert_after_paragraph(html: str, anchor: str, figures: list[tuple[str, str]]) -> str:
    anchor_index = html.find(anchor)
    if anchor_index < 0:
        raise ValueError(f"Anchor not found: {anchor}")
    end = html.find("</p>", anchor_index)
    if end < 0:
        raise ValueError(f"Paragraph end not found: {anchor}")
    end += len("</p>")
    markup = figure_group(figures)
    return html[:end] + "\n" + markup + html[end:]


def insert_after_heading(html: str, heading: str, figures: list[tuple[str, str]]) -> str:
    anchor_index = html.find(heading)
    if anchor_index < 0:
        raise ValueError(f"Heading not found: {heading}")
    end = html.find("</h2>", anchor_index)
    if end < 0:
        raise ValueError(f"Heading end not found: {heading}")
    end += len("</h2>")
    markup = figure_group(figures)
    return html[:end] + "\n" + markup + html[end:]


def build(source: Path) -> str:
    blocks: list[tuple[str, str]] = [("heading", "ARTICLE ARCHIVE / 2023")]
    with pdfplumber.open(source) as pdf:
        for page_number in range(2, 22):
            paragraphs = body_paragraphs(pdf.pages[page_number - 1])
            heading_position, heading = SECTION_HEADINGS.get(page_number, (None, None))

            if heading_position == "before":
                blocks.append(("heading", heading))

            if paragraphs and blocks and blocks[-1][0] == "paragraph" and not is_finished(blocks[-1][1]):
                first = paragraphs.pop(0)
                blocks[-1] = ("paragraph", blocks[-1][1] + first)

            if heading_position == "after_first":
                blocks.append(("heading", heading))

            blocks.extend(("paragraph", paragraph) for paragraph in paragraphs)

    html = "\n".join(
        f"<h2>{escape(text)}</h2>" if kind == "heading" else paragraph_markup(text)
        for kind, text in blocks
    )

    html = insert_after_heading(html, "1 / 现场", [("01-basel-floor.jpg", "Basel 现场")])
    html = insert_after_paragraph(html, "不过当你看到这篇文章", [("02-basel-floor.jpg", "Basel 现场")])
    html = insert_after_paragraph(html, "卷不卷", [("03-basel-floor.jpg", "Basel 现场")])
    html = insert_after_paragraph(html, "所以说从挑起观众的FOMO", [("04-basel-floor.jpg", "Basel 现场")])
    html = insert_after_paragraph(html, "在艺博会上，艺术品与奢侈品", [("05-basel-floor.jpg", "Basel 现场")])
    html = insert_after_heading(html, "2 / 是什么奠定", [("06-hong-kong.jpg", "香港城市景观")])
    html = insert_after_paragraph(html, "更重要的是，香港还拥有", [("07-sothebys.jpg", "中国香港苏富比拍卖会现场")])
    html = insert_after_paragraph(
        html,
        "香港高昂的房租和商业环境",
        [
            ("08-mak2.jpg", "艺术家 mak2"),
            ("09-samson-young.jpg", "艺术家 Samson Young"),
            ("10-sarah-lai.jpg", "艺术家 Sarah Lai"),
        ],
    )
    html = insert_after_heading(html, "4 / 艺术巴塞尔进入香港", [("11-h-queen.jpg", "H Queen 大厦")])
    html = insert_after_paragraph(
        html,
        "香港巴塞尔展入驻香港的十年间",
        [
            ("12-david-zwirner.jpg", "David Zwirner 香港空间"),
            ("13-gallery-interior.jpg", "H Queen 大厦内画廊空间"),
            ("14-gallery-interior.jpg", "H Queen 大厦内画廊空间"),
            ("15-pace.jpg", "Pace 香港空间"),
            ("16-gallery-interior.jpg", "H Queen 大厦内画廊空间"),
            ("17-h-queen-map.jpg", "H Queen 大厦汇集了数家国际蓝筹画廊 / © H Queen"),
        ],
    )
    html = insert_after_paragraph(
        html,
        "总之，香港巴塞尔展入驻香港的十年间",
        [("18-beeple.jpg", "Beeple 作品在本届巴塞尔艺术展厉蔚阁画廊展位")],
    )
    html = insert_after_paragraph(
        html,
        "今年全然未在香港巴塞尔看到",
        [
            ("19-metavision.jpg", "K11 Musea “Metavision” / Photo by Cecciccc"),
            ("20-outland.jpg", "Outland 在香港巴塞尔同期举办的一周年庆典活动"),
        ],
    )
    html = insert_after_paragraph(
        html,
        "在找到新的平衡点之前",
        [("21-basel-crowd.jpg", "Basel 第一天现场")],
    )
    html += (
        '\n<p class="article-note">图片致谢 Life and Arts 集锦；原文首发于 Life and Arts 集锦。'
        "撰稿、审校 / 王莲仪；视觉设计 / 姜伟阳、曹可艺；排版 / 韩紫嫣。</p>"
    )
    return html.rstrip() + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(build(args.source), encoding="utf-8")


if __name__ == "__main__":
    main()
