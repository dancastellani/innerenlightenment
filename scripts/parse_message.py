"""Turns one fonteviva.org WordPress post into a clean message dict.

Post HTML: a `.fonte` header with `p.capitulo`, `p.livro`, `p.espirito`, `p.autor`,
then `.article` with body paragraphs, `p.assinatura`, and an optional place/date line.
"""

import re
from html import unescape

HEADER_CLASSES = {"capitulo", "livro", "espirito", "autor"}


def to_text(html):
    """Strips tags from an HTML fragment, keeping <br> as a line break."""
    text = re.sub(r"\s+", " ", html)
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = unescape(re.sub(r"<[^>]+>", "", text))
    return "\n".join(line.strip() for line in text.split("\n") if line.strip())


def parse_message(post, book):
    paragraphs = []
    for attrs, inner in re.findall(r"<p\b([^>]*)>(.*?)</p>", post["content"]["rendered"], re.S | re.I):
        text = to_text(inner)
        if text:
            classes = set(re.findall(r'class="([^"]*)"', attrs)[0].split()) if "class=" in attrs else set()
            paragraphs.append((classes, text))

    def by_class(name):
        return next((text for classes, text in paragraphs if name in classes), None)

    body, signature, after = [], None, []
    for classes, text in paragraphs:
        if classes & HEADER_CLASSES:
            continue
        if "assinatura" in classes:
            signature = text
        else:
            (body if signature is None else after).append(text)

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
        "note": "\n".join(after) or None,
    }
