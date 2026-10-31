from pathlib import Path
import sys

from docx import Document


for source in sys.argv[1:]:
    path = Path(source)
    document = Document(path)
    print(f"\nFILE: {path}")
    print(
        "paragraphs",
        len(document.paragraphs),
        "inline_shapes",
        len(document.inline_shapes),
        "tables",
        len(document.tables),
    )
    for index, paragraph in enumerate(document.paragraphs):
        text = paragraph.text.strip()
        if text:
            print(f"{index:03d}\t{paragraph.style.name!r}\t{text}")
