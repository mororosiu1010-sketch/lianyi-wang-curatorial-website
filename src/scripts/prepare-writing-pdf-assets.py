"""Prepare selected body images extracted from the three article PDFs."""

from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]

PLANS = {
    "p01nt": [
        ("p02-01.png", "01-poster.jpg"),
        ("p03-01.png", "02-bitcoin-2022.jpg"),
        ("p04-01.png", "03-bca-gallery.jpg"),
        ("p05-01.png", "04-point.jpg"),
        ("p05-02.png", "05-line.jpg"),
        ("p06-01.png", "06-triangle.jpg"),
        ("p07-01.png", "07-rolling-stone.jpg"),
        ("p09-01.png", "08-triangle-screen.jpg"),
        ("p09-02.png", "09-square-screen.jpg"),
        ("p09-03.png", "10-circle-screen.jpg"),
        ("p11-01.png", "11-curatorial-diagram.jpg"),
        ("p12-01.png", "12-online-interface.jpg"),
        ("p12-02.png", "13-online-to-gallery.jpg"),
        ("p13-01.png", "14-reddit-place.jpg"),
        ("p14-01.png", "15-p01nt-object.jpg"),
        ("p15-01.png", "16-nft-nyc.jpg"),
        ("p15-02.png", "17-usee-design-week.jpg"),
        ("p16-01.png", "18-shanghai-eye.jpg"),
    ],
    "crypto-ecosystem": [
        ("p01-01.png", "01-crypto-shanghai.jpg"),
        ("p02-01.png", "02-exhibition-posters.jpg"),
        ("p04-01.png", "03-exhibition-view.jpg"),
        ("p04-02.png", "04-exhibition-view.jpg"),
        ("p05-01.png", "05-money-unrelated.jpg"),
        ("p06-01.png", "06-installation.jpg"),
        ("p07-01.png", "07-artwork.jpg"),
        ("p07-02.png", "08-artwork.jpg"),
        ("p08-01.png", "09-artwork.jpg"),
        ("p08-02.png", "10-artwork.jpg"),
        ("p09-01.png", "11-exhibition-view.jpg"),
        ("p09-02.png", "12-exhibition-view.jpg"),
        ("p10-01.png", "13-exhibition-view.jpg"),
        ("p10-02.png", "14-exhibition-view.jpg"),
        ("p11-01.png", "15-abstract-oracle-miner.jpg"),
        ("p13-01.png", "16-jonas-lund-token.jpg"),
        ("p14-01.png", "17-naughty-api-gallery.jpg"),
        ("p15-01.png", "18-internet-seance.jpg"),
        ("p16-01.png", "19-small-goal.jpg"),
        ("p17-01.png", "20-crypto-shanghai.jpg"),
        ("p17-02.png", "21-crypto-shanghai.jpg"),
        ("p18-01.png", "22-crypto-shanghai.jpg"),
        ("p18-02.png", "23-crypto-shanghai.jpg"),
        ("p19-01.png", "24-crypto-shanghai.jpg"),
        ("p21-01.png", "25-cryptokitties.jpg"),
    ],
    "hk-art-basel": [
        ("p02-02.png", "01-basel-floor.jpg"),
        ("p03-01.png", "02-basel-floor.jpg"),
        ("p04-01.png", "03-basel-floor.jpg"),
        ("p05-01.png", "04-basel-floor.jpg"),
        ("p06-01.png", "05-basel-floor.jpg"),
        ("p07-01.png", "06-hong-kong.jpg"),
        ("p08-01.png", "07-sothebys.jpg"),
        ("p09-02.png", "08-mak2.jpg"),
        ("p10-01.png", "09-samson-young.jpg"),
        ("p10-02.png", "10-sarah-lai.jpg"),
        ("p12-01.png", "11-h-queen.jpg"),
        ("p13-01.png", "12-david-zwirner.jpg"),
        ("p13-02.png", "13-gallery-interior.jpg"),
        ("p14-01.png", "14-gallery-interior.jpg"),
        ("p15-01.png", "15-pace.jpg"),
        ("p15-02.png", "16-gallery-interior.jpg"),
        ("p16-01.png", "17-h-queen-map.jpg"),
        ("p17-01.png", "18-beeple.jpg"),
        ("p18-01.png", "19-metavision.jpg"),
        ("p19-01.png", "20-outland.jpg"),
        ("p20-02.png", "21-basel-crowd.jpg"),
    ],
}


def flatten(image: Image.Image) -> Image.Image:
    if image.mode in {"RGBA", "LA"}:
        background = Image.new("RGB", image.size, "white")
        alpha = image.getchannel("A")
        background.paste(image.convert("RGB"), mask=alpha)
        return background
    return image.convert("RGB")


for slug, files in PLANS.items():
    source_dir = ROOT / "tmp" / "pdfs" / slug / "images"
    output_dir = ROOT / "src" / "assets" / "writing" / slug
    output_dir.mkdir(parents=True, exist_ok=True)
    for source_name, output_name in files:
        image = flatten(Image.open(source_dir / source_name))
        image.save(output_dir / output_name, "JPEG", quality=86, optimize=True, progressive=True)
    print(f"{slug}: {len(files)} body images")
