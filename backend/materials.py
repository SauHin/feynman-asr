"""Teks materi kuliah untuk ekstraksi konsep (PLAN 4 Tahap 1, PLAN 7.3 panggilan 1).

PDF dibaca dengan PyMuPDF. PPTX dibaca langsung dari XML di dalam zip-nya, karena python-pptx ikut membawa
lxml, Pillow, dan XlsxWriter hanya untuk membaca teks. TXT dan MD dipakai apa adanya.
"""
import io
import posixpath
import zipfile
from xml.etree import ElementTree

import pymupdf

FORMATS = ("pdf", "pptx", "txt", "md")

_P = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
_R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
_A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
_REL = "{http://schemas.openxmlformats.org/package/2006/relationships}"


class MaterialError(Exception):
    """Materi tidak bisa dipakai. Pesannya ditampilkan ke user apa adanya."""


def extract_text(name: str, data: bytes, pages: list[int] | None = None) -> str:
    """Teks materi. pages: nomor halaman PDF atau slide PPTX, mulai dari 1. Kosong berarti semua."""
    ext = name.rsplit(".", 1)[-1].lower()
    if ext not in FORMATS:
        raise MaterialError("Format ini belum bisa dibaca. Coba PDF, PPTX, TXT, atau MD.")
    if ext in ("txt", "md"):
        text = data.decode("utf-8", errors="replace")
    else:
        parts, unit = (_pdf_pages(data), "halaman") if ext == "pdf" else (_pptx_slides(data), "slide")
        if pages and max(pages) > len(parts):
            raise MaterialError(f"Materinya cuma punya {len(parts)} {unit}. Cek lagi nomornya, ya.")
        text = "\n\n".join(parts[p - 1] for p in pages) if pages else "\n\n".join(parts)
    if not text.strip():
        raise MaterialError("Aku nggak nemu teks di materi ini. Kalau PDF-nya hasil scan, tempel teksnya aja.")
    return text.strip()


def _pdf_pages(data: bytes) -> list[str]:
    try:
        with pymupdf.open(stream=data, filetype="pdf") as doc:
            if doc.needs_pass:
                raise MaterialError("PDF-nya dikunci password. Buka kuncinya dulu, terus upload lagi.")
            return [page.get_text() for page in doc]
    except (pymupdf.FileDataError, RuntimeError) as e:
        raise MaterialError("File PDF-nya nggak bisa dibuka. Mungkin rusak.") from e


def _pptx_slides(data: bytes) -> list[str]:
    # Urutan slide diambil dari presentation.xml, bukan dari nama file slideN.xml: nama itu tidak ikut
    # berubah saat slide dipindah urutannya di PowerPoint.
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            rels = ElementTree.fromstring(z.read("ppt/_rels/presentation.xml.rels"))
            target = {r.get("Id"): r.get("Target", "") for r in rels.iter(_REL + "Relationship")}
            order = ElementTree.fromstring(z.read("ppt/presentation.xml")).iter(_P + "sldId")
            slides = []
            for s in order:
                t = target[s.get(_R + "id")]
                path = t.lstrip("/") if t.startswith("/") else posixpath.normpath(posixpath.join("ppt", t))
                root = ElementTree.fromstring(z.read(path))
                slides.append("\n".join("".join(r.text or "" for r in p.iter(_A + "t")) for p in root.iter(_A + "p")))
            return slides
    except (zipfile.BadZipFile, KeyError, ElementTree.ParseError) as e:
        raise MaterialError("File PPTX-nya nggak bisa dibuka. Coba simpan ulang, atau ekspor ke PDF.") from e
