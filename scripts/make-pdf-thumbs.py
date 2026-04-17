"""Render first-page thumbnails of each program PDF in public/assets/vault/.

Outputs <stem>-thumb.jpg next to the source PDF. Safe to re-run.
"""
from pathlib import Path
import fitz  # PyMuPDF

VAULT = Path(__file__).resolve().parents[1] / "public" / "assets" / "vault"
TARGET_WIDTH = 800  # px; scaled to match card display

def render_thumb(pdf_path: Path) -> Path:
    out = pdf_path.with_name(pdf_path.stem + "-thumb.jpg")
    with fitz.open(pdf_path) as doc:
        page = doc[0]
        rect = page.rect
        zoom = TARGET_WIDTH / rect.width
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        pix.save(out, jpg_quality=82)
    return out

def main():
    pdfs = sorted(VAULT.glob("*.pdf"))
    for pdf in pdfs:
        out = render_thumb(pdf)
        print(f"{pdf.name} -> {out.name} ({out.stat().st_size // 1024} KB)")

if __name__ == "__main__":
    main()
