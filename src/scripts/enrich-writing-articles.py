"""Insert the original PDF body images into the two Word-based articles."""

from __future__ import annotations

from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


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
    paragraph_end = html.find("</p>", anchor_index)
    if paragraph_end < 0:
        raise ValueError(f"Paragraph end not found for: {anchor}")
    paragraph_end += len("</p>")
    markup = figure_group(figures)
    return html[:paragraph_end] + "\n" + markup + html[paragraph_end:]


def insert_after_label(html: str, figures: list[tuple[str, str]]) -> str:
    heading_end = html.find("</h2>")
    if heading_end < 0:
        raise ValueError("Article label not found")
    heading_end += len("</h2>")
    markup = figure_group(figures)
    return html[:heading_end] + "\n" + markup + html[heading_end:]


def enrich(path: Path, opening: list[tuple[str, str]], insertions) -> None:
    html = path.read_text(encoding="utf-8")
    if "@@ASSET_PREFIX@@" in html:
        raise ValueError(f"Images already inserted in {path}")
    html = insert_after_label(html, opening)
    for anchor, figures in insertions:
        html = insert_after_paragraph(html, anchor, figures)
    path.write_text(html.rstrip() + "\n", encoding="utf-8")


enrich(
    ROOT / "src/content/writing/p01nt.html",
    [("01-poster.jpg", "「P01NT」展览海报")],
    [
        ("随着2022年的落幕", [("02-bitcoin-2022.jpg", "「P01NT」在 Bitcoin 2022")]),
        ("「P01NT」的每个符号", [("03-bca-gallery.jpg", "「P01NT」于 BCA Gallery 外滩香港路展厅")]),
        (
            "这个互动过程就使得",
            [
                ("04-point.jpg", "「P01NT」的基础“画布”：点"),
                ("05-line.jpg", "「P01NT」的基础“画布”：线"),
                ("06-triangle.jpg", "「P01NT」的基础“画布”：面与形状"),
            ],
        ),
        ("那我们就从无聊谈起吧", [("07-rolling-stone.jpg", "无聊猿登上《Rolling Stone》杂志封面")]),
        (
            "在我看来，「P01NT」就是这样",
            [
                ("08-triangle-screen.jpg", "「P01NT」异形展示屏幕：三角"),
                ("09-square-screen.jpg", "「P01NT」异形展示屏幕：方形"),
                ("10-circle-screen.jpg", "「P01NT」异形展示屏幕：圆形"),
            ],
        ),
        ("很多人认为“观看”", [("11-curatorial-diagram.jpg", "「P01NT」策展示意图")]),
        (
            "然后是策展关系的改变",
            [
                ("12-online-interface.jpg", "「P01NT」线上官网"),
                ("13-online-to-gallery.jpg", "线上操作实时同步至线下展览屏幕"),
            ],
        ),
        ("不难看出这个过程是致敬了reddit", [("14-reddit-place.jpg", "Reddit Place 2022")]),
        ("「P01NT」的呈现方式则让NFT", [("15-p01nt-object.jpg", "「P01NT」实体呈现")]),
        (
            "在一波又一波的WEB 3热潮下",
            [
                ("16-nft-nyc.jpg", "「P01NT」在 NFT.NYC 2022"),
                ("17-usee-design-week.jpg", "「P01NT」在阿里巴巴 Usee 设计周"),
                ("18-shanghai-eye.jpg", "「P01NT」参与“SkyEye·上海之眼”项目"),
            ],
        ),
    ],
)

enrich(
    ROOT / "src/content/writing/crypto-art-ecosystem.html",
    [("01-crypto-shanghai.jpg", "《加密上海》相关现场")],
    [
        ("其实同期与“加密艺术”有关的展览", [("02-exhibition-posters.jpg", "同期加密艺术展览视觉")]),
        (
            "所以当我在本文提及加密艺术的时候",
            [
                ("03-exhibition-view.jpg", "相关加密艺术展览现场"),
                ("04-exhibition-view.jpg", "相关加密艺术展览现场"),
                ("05-money-unrelated.jpg", "《与钱无关：登陆元宇宙》展览现场"),
            ],
        ),
        (
            "我没有亲自去到《飞出个未来",
            [
                ("06-installation.jpg", "相关展览现场与作品"),
                ("07-artwork.jpg", "相关展览现场与作品"),
                ("08-artwork.jpg", "相关展览现场与作品"),
                ("09-artwork.jpg", "相关展览现场与作品"),
                ("10-artwork.jpg", "相关展览现场与作品"),
            ],
        ),
        (
            "在这几个展览中，雷电所作为专业的策展机构",
            [
                ("11-exhibition-view.jpg", "相关展览现场"),
                ("12-exhibition-view.jpg", "相关展览现场"),
                ("13-exhibition-view.jpg", "《飞出个未来：区块链中的时间多重性》展览现场"),
                ("14-exhibition-view.jpg", "《飞出个未来：区块链中的时间多重性》展览现场"),
            ],
        ),
        (
            "懂加密艺术背景且技术过硬的geek艺术家们",
            [
                ("15-abstract-oracle-miner.jpg", "郭城《抽象神谕矿机》"),
                ("16-jonas-lund-token.jpg", "乔纳斯·隆德《乔纳斯·隆德代币》"),
                ("17-naughty-api-gallery.jpg", "周蓬岸《调皮的 API 画廊》"),
            ],
        ),
        ("那有没有这两点都做得挺好的", [("18-internet-seance.jpg", "西蒙·丹尼与盖尔·特瓦尔多夫斯基《互联网降灵大会》")]),
        ("所以整个展览看完", [("19-small-goal.jpg", "刘嘉颖《一个小目标》")]),
        (
            "《加密上海》则有些一言难尽",
            [
                ("20-crypto-shanghai.jpg", "《加密上海》展览现场"),
                ("21-crypto-shanghai.jpg", "《加密上海》展览现场"),
                ("22-crypto-shanghai.jpg", "《加密上海》展览现场"),
                ("23-crypto-shanghai.jpg", "《加密上海》展览现场"),
                ("24-crypto-shanghai.jpg", "《加密上海》展览现场"),
            ],
        ),
        ("让我们再次回顾文章开头", [("25-cryptokitties.jpg", "古列·特沃斯基《加密猫》")]),
    ],
)
