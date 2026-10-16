"""Turns one fonteviva.org WordPress post into a clean message dict.

Post HTML looks like:

    <div class="Section1">
      <div class="fonte">
        <p class="capitulo">…</p> <p class="livro">Livro: …</p>
        <p class="espirito">…</p> <p class="autor">…</p>
      </div>
      <div class="article"> <p>…</p> … <p class="assinatura">…</p> <p>…</p> </div>
    </div>
"""

from __future__ import annotations

import re
from html import unescape
from html.parser import HTMLParser

HEADER_CLASSES = {"capitulo", "livro", "espirito", "autor"}


def clean_text(text: str) -> str:
    """Collapses whitespace on each line and drops empty lines."""
    lines = (re.sub(r"\s+", " ", line).strip() for line in text.split("\n"))
    return "\n".join(line for line in lines if line)


def to_text(html: str) -> str:
    """Strips tags from an HTML fragment, keeping <br> as a line break."""
    text = re.sub(r"\s+", " ", html)
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    return clean_text(unescape(text))


class _ParagraphCollector(HTMLParser):
    """Collects (classes, text) for every <p> in document order."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.paragraphs: list[tuple[set[str], str]] = []
        self._classes: set[str] | None = None
        self._parts: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag == "p":
            self._finish()
            self._classes = set((dict(attrs).get("class") or "").split())
            self._parts = []
        elif tag == "br" and self._classes is not None:
            self._parts.append("\n")

    def handle_endtag(self, tag):
        if tag == "p":
            self._finish()

    def handle_data(self, data):
        if self._classes is not None:
            self._parts.append(re.sub(r"\s+", " ", data))

    def close(self):
        super().close()
        self._finish()

    def _finish(self):
        if self._classes is None:
            return
        text = clean_text("".join(self._parts))
        if text:
            self.paragraphs.append((self._classes, text))
        self._classes = None
        self._parts = []


def parse_message(post: dict, book: str | None) -> dict:
    collector = _ParagraphCollector()
    collector.feed(post["content"]["rendered"])
    collector.close()
    paragraphs = collector.paragraphs

    def by_class(name: str) -> str | None:
        return next((text for classes, text in paragraphs if name in classes), None)

    body: list[str] = []
    signature: str | None = None
    after_signature: list[str] = []
    for classes, text in paragraphs:
        if classes & HEADER_CLASSES:
            continue
        if "assinatura" in classes:
            signature = text
        elif signature is None:
            body.append(text)
        else:
            after_signature.append(text)

    return {
        "id": post["id"],
        "slug": post["slug"],
        "url": post["link"],
        "book": book,
        "title": to_text(post["title"]["rendered"]),
        "chapter": by_class("capitulo"),
        "spirit": by_class("espirito"),
        "medium": by_class("autor"),
        "paragraphs": body,
        "signature": signature,
        "note": "\n".join(after_signature) or None,
    }
