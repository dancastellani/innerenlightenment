"""Exports every message from fonteviva.org (WordPress REST API) to JSON.

Usage: python -m scripts.export_fonteviva [output-path]   (default: content/pt.json)
"""

from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from scripts.parse_message import parse_message, to_text

API = "https://fonteviva.org/wp-json/wp/v2"


def get_json(url: str) -> tuple[list, dict]:
    request = urllib.request.Request(url, headers={"User-Agent": "innerenlightenment-export"})
    for attempt in range(1, 5):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                return json.load(response), dict(response.headers)
        except urllib.error.HTTPError as error:
            if attempt == 4 or error.code < 500:
                raise
        except urllib.error.URLError:
            if attempt == 4:
                raise
        time.sleep(2**attempt)
    raise AssertionError("unreachable")


def fetch_all(path: str) -> list[dict]:
    items: list[dict] = []
    separator = "&" if "?" in path else "?"
    page = 1
    while True:
        data, headers = get_json(f"{API}/{path}{separator}per_page=100&page={page}")
        items.extend(data)
        total_pages = int({k.lower(): v for k, v in headers.items()}.get("x-wp-totalpages", 1))
        print(f"{path}: page {page}/{total_pages}", file=sys.stderr)
        if page >= total_pages:
            return items
        page += 1


def main() -> None:
    output = Path(sys.argv[1] if len(sys.argv) > 1 else "content/pt.json")

    categories = fetch_all("categories?_fields=id,name,slug,count")
    books = [
        {"id": c["id"], "slug": c["slug"], "name": to_text(c["name"]), "count": c["count"]}
        for c in categories
        if c["count"] > 0
    ]
    book_slug_by_id = {b["id"]: b["slug"] for b in books}

    posts = fetch_all("posts?_fields=id,slug,link,title,categories,content&orderby=id&order=asc")
    messages = []
    for post in posts:
        book = next((book_slug_by_id[c] for c in post["categories"] if c in book_slug_by_id), None)
        message = parse_message(post, book)
        if not message["book"] or not message["paragraphs"]:
            print(f"warning: {message['url']} has no book or no body", file=sys.stderr)
        messages.append(message)

    result = {
        "source": "https://fonteviva.org/",
        "language": "pt",
        "books": [{k: b[k] for k in ("slug", "name", "count")} for b in books],
        "messages": messages,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(result, ensure_ascii=False, indent=1) + "\n"
    output.write_text(text, encoding="utf-8")
    size_kb = len(text.encode("utf-8")) / 1024
    print(f"wrote {len(messages)} messages ({size_kb:.0f} KB) to {output}", file=sys.stderr)


if __name__ == "__main__":
    main()
