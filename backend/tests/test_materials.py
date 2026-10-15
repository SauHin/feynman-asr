import io
import zipfile

import pymupdf
import pytest

from materials import MaterialError, extract_text


def pdf(*pages: str) -> bytes:
    doc = pymupdf.open()
    for text in pages:
        doc.new_page().insert_text((72, 72), text)
    return doc.tobytes()


def pptx(*slides: str) -> bytes:
    """PPTX minimal. File slide sengaja dinomori terbalik, seperti setelah slide diurutkan ulang."""
    ns = ('xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" '
          'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
          'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"')
    n = len(slides)
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        ids = "".join(f'<p:sldId id="{256 + i}" r:id="rId{i}"/>' for i in range(n))
        z.writestr("ppt/presentation.xml", f"<p:presentation {ns}><p:sldIdLst>{ids}</p:sldIdLst></p:presentation>")
        rels = "".join(f'<Relationship Id="rId{i}" Target="slides/slide{n - i}.xml"/>' for i in range(n))
        z.writestr("ppt/_rels/presentation.xml.rels",
                   f'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{rels}</Relationships>')
        for i, text in enumerate(slides):
            # Satu paragraf bisa terpecah jadi beberapa potongan teks dengan format berbeda.
            runs = "".join(f"<a:r><a:t>{w}</a:t></a:r>" for w in text.split("|"))
            z.writestr(f"ppt/slides/slide{n - i}.xml", f"<p:sld {ns}><a:p>{runs}</a:p></p:sld>")
    return buf.getvalue()


def test_pdf_keeps_only_the_chosen_pages():
    text = extract_text("kuliah.PDF", pdf("Forward pass", "Loss function", "Chain rule"), [1, 3])
    assert "Forward pass" in text and "Chain rule" in text and "Loss" not in text


def test_pptx_follows_the_presentation_order():
    data = pptx("Forward |pass", "Loss function", "Chain rule")
    assert extract_text("slide.pptx", data).split("\n\n") == ["Forward pass", "Loss function", "Chain rule"]
    assert extract_text("slide.pptx", data, [2]) == "Loss function"


def test_text_files_are_read_as_utf8():
    assert extract_text("catatan.md", "# Gradien\nTurunan parsial".encode()) == "# Gradien\nTurunan parsial"


@pytest.mark.parametrize("name, data, pages, message", [
    ("slide.key", b"x", None, "Format"),
    ("kuliah.pdf", pdf("a", "b"), [3], "cuma punya 2 halaman"),
    ("kuliah.pdf", pdf(""), None, "hasil scan"),
    ("kuliah.pdf", b"bukan pdf", None, "PDF-nya nggak bisa dibuka"),
    ("slide.pptx", b"bukan zip", None, "PPTX-nya nggak bisa dibuka"),
])
def test_unusable_material_gets_a_message_for_the_user(name, data, pages, message):
    with pytest.raises(MaterialError, match=message):
        extract_text(name, data, pages)
