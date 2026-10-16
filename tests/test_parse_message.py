import unittest

from scripts.parse_message import parse_message, to_text

POST = {
    "id": 1485,
    "slug": "brilhe-vossa-luz",
    "link": "https://fonteviva.org/vinha-de-luz/brilhe-vossa-luz/",
    "title": {"rendered": "Brilhe vossa luz"},
    "categories": [7],
    "content": {
        "rendered": """<div class="Section1">
<div class="fonte">
<p class="capitulo">Pref&aacute;cio</p>
<p class="livro">Livro: Vinha de Luz</p>
<p class="espirito">Emmanuel</p>
<p class="autor">Francisco C&#226;ndido Xavier</p>
</div>
<div class="article">
<p>Primeiro par&#225;grafo,
com quebra.</p>
<!-- comentário -->
<p><em>Segundo</em> &#8220;par&aacute;grafo&#8221;.<br />Nova linha.</p>
<p class="assinatura">Emmanuel</p>
<p>Pedro Leopoldo, 25 de novembro de 1951.</p>
</div>
</div>"""
    },
}


class ParseMessageTest(unittest.TestCase):
    def test_parses_header_body_signature_and_note(self):
        m = parse_message(POST, "vinha-de-luz")
        self.assertEqual(m["title"], "Brilhe vossa luz")
        self.assertEqual(m["chapter"], "Prefácio")
        self.assertEqual(m["spirit"], "Emmanuel")
        self.assertEqual(m["medium"], "Francisco Cândido Xavier")
        self.assertEqual(
            m["paragraphs"],
            ["Primeiro parágrafo, com quebra.", "Segundo “parágrafo”.\nNova linha."],
        )
        self.assertEqual(m["signature"], "Emmanuel")
        self.assertEqual(m["note"], "Pedro Leopoldo, 25 de novembro de 1951.")
        self.assertEqual(m["url"], POST["link"])
        self.assertEqual(m["book"], "vinha-de-luz")

    def test_to_text_decodes_entities(self):
        self.assertEqual(to_text("&#xE3;o &amp; &hellip; &Atilde;&ccedil;"), "ão & … Ãç")


if __name__ == "__main__":
    unittest.main()
