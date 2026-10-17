@OP-05 @ops
Feature: Build and publish the website
  As the owner, I want the website built and published automatically on every merge,
  so anyone can read the messages in a browser without installing the app (issue #35).
  scripts/build-site.ts turns content/<lang>.json into static pages, using the templates,
  stylesheet and language labels in website/. Each message has its own page at <lang>/<slug>/,
  the link the app can share.

  Background:
    Given the saved sample content with 2 messages in Portuguese and 1 in English

  @OP-05.1
  Scenario: One page per message in each language
    When the website is built
    Then it succeeds
    And there are pages "pt/o-tempo/", "pt/fe-e-obras/" and "en/o-tempo/"

  @OP-05.2
  Scenario: A message page shows the whole message and its link to fonteviva.org
    When the website is built
    Then the page "en/o-tempo/" contains "Time", "First paragraph.", "Second paragraph." and "Emmanuel"
    And the page "en/o-tempo/" contains "via Francisco Candido Xavier"
    And the page "pt/o-tempo/" links to "https://fonteviva.org/fonte-viva/o-tempo/"

  # Same as the app's UC-07.2: a translated page opens the original through Google Translate.
  @OP-05.19
  Scenario: A translated page links to fonteviva.org through Google Translate
    When the website is built
    Then the page "en/o-tempo/" links to "https://fonteviva-org.translate.goog/fonte-viva/o-tempo/?_x_tr_sl=pt&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp"

  @OP-05.3
  Scenario: A message page links to the same message in the other languages
    When the website is built
    Then the page "en/o-tempo/" links to "../../pt/o-tempo/"
    And the page "pt/o-tempo/" links to "../../en/o-tempo/"

  @OP-05.16
  Scenario: A message page shows which language is selected, as text and not a link
    When the website is built
    Then the page "pt/o-tempo/" marks "Português" as the selected language
    And the page "en/o-tempo/" marks "English" as the selected language

  @OP-05.17
  Scenario: A message page links to the index of its language
    When the website is built
    Then the page "pt/o-tempo/" has the link "Índice" to "../"
    And the page "en/o-tempo/" has the link "Index" to "../"

  @OP-05.4
  Scenario: The home page opens a random English message
    When the website is built
    Then the page "" opens a random message of "en/" from "o-tempo"
    And without JavaScript the page "" links to "pt/" and "en/"

  @OP-05.10
  Scenario: "Another message" opens a random message in the same language
    When the website is built
    Then the page "pt/o-tempo/" links to "../random/"
    And the page "pt/random/" opens a random message of "../" from "o-tempo" and "fe-e-obras"

  @OP-05.11
  Scenario: Every message page credits fonteviva.org and has one disclaimer in its language
    When the website is built
    Then the page "en/o-tempo/" contains "Marcelo Paiva" and "not responsible or liable"
    And the page "pt/o-tempo/" contains "Marcelo Paiva" and "não se responsabiliza"
    And the page "en/o-tempo/" has "Disclaimer:" only once

  @OP-05.14
  Scenario: A translated message's disclaimer says it was translated by AI, without guarantee
    When the website is built
    Then the page "en/o-tempo/" contains "for their content. This message was translated from the Portuguese original by AI" and "without guarantee"
    And the page "pt/o-tempo/" does not contain "translated from the Portuguese original"

  @OP-05.5
  Scenario: A language page lists its messages by book
    When the website is built
    Then the page "pt/" contains "Fonte Viva"
    And the page "pt/" links to "o-tempo/" and "fe-e-obras/"

  @OP-05.18
  Scenario: A language page starts with its books, each a link to its messages
    When the website is built
    Then the page "pt/" has the link "Fonte Viva" to "#fonte-viva" before the first message
    And the page "pt/" has the book heading "fonte-viva"

  @OP-05.12
  Scenario: Every merge publishes the website
    Then the "Website" workflow runs on every push to main
    And it runs "./run.sh site"
    And it publishes the "site" folder with GitHub Pages

  # In a browser (headless Chrome, phone-sized): what only a browser shows

  @OP-05.21
  Scenario: In a browser, the home page opens the English message
    When the website is built
    And the page "" is opened in a browser
    Then the browser is on the page "en/o-tempo/"

  @OP-05.22
  Scenario: In a browser, "Another message" opens a message in the same language
    When the website is built
    And the page "pt/o-tempo/" is opened in a browser
    And the link "Outra mensagem" is clicked
    Then the browser is on the page "pt/o-tempo/" or "pt/fe-e-obras/"

  @OP-05.23
  Scenario: In a browser, every link from a message page to the website opens a page
    When the website is built
    And the page "en/o-tempo/" is opened in a browser
    Then every link on it to the website opens a page

  @OP-05.24
  Scenario: In a browser, a message page fits the smallest common phone screen, 320 pixels wide
    When the website is built
    And the page "pt/o-tempo/" is opened in a browser
    Then it does not scroll sideways

  # UC-18 on the website: compare a translation with the Portuguese original.
  @OP-05.25
  Scenario: In a browser, "Original" shows the Portuguese text after each paragraph, and hides it again
    When the website is built
    And the page "en/o-tempo/" is opened in a browser
    Then the browser does not show "Primeiro parágrafo."
    When "Original" is tapped
    Then the browser shows "First paragraph.", "Primeiro parágrafo.", "Second paragraph." and "Segundo parágrafo."
    When "Original" is tapped
    Then the browser does not show "Primeiro parágrafo." and "Segundo parágrafo."

  @OP-05.27
  Scenario: In a browser, the menu at the top right opens the index and the languages, and closes again
    When the website is built
    And the page "en/o-tempo/" is opened in a browser
    Then the browser does not show "Index" and "Português"
    When the menu is tapped
    Then the browser shows "Index", "English" and "Português"
    When the menu is tapped
    Then the browser does not show "Index" and "Português"

  @OP-05.26
  Scenario: The Portuguese page is marked as the original and has no "Original" switch
    When the website is built
    Then the page "pt/o-tempo/" contains "Texto original"
    And the page "pt/o-tempo/" does not contain "show-original"

  @OP-05.27
  Scenario: Every page shows the app's icon in the browser tab
    When the website is built
    Then the page "" contains "favicon.svg"
    And the page "pt/o-tempo/" contains "../../favicon.svg"

  # UC-19 on the website: find a study group.
  @OP-05.28
  Scenario: Each language has a study groups page with the three organizations
    When the website is built
    Then the page "en/study-groups/" links to "https://www.innerenlightenment.com/", "https://www.tssfederation.org/" and "https://spiritist.us/spiritist-movement/"
    And the page "en/study-groups/" contains "Inner Enlightenment Spiritist Society in NYC" and "Tri-State Spiritist Federation"
    And the page "en/study-groups/" contains "United States Spiritist Federation" and "in-person and online"
    And the page "pt/study-groups/" contains "Grupos de estudo" and "presenciais e online"

  @OP-05.29
  Scenario: A message page links to the study groups page of its language
    When the website is built
    Then the page "en/o-tempo/" has the link "Study groups" to "../study-groups/"
    And the page "pt/o-tempo/" has the link "Grupos de estudo" to "../study-groups/"

  # Edge cases

  @OP-05.6
  Scenario: A message not translated yet has no page or link in that language
    When the website is built
    Then there is no page "en/fe-e-obras/"
    And the page "pt/fe-e-obras/" does not link to "../../en/fe-e-obras/"

  @OP-05.7
  Scenario: A message without signature or chapter shows no empty or "null" text
    When the website is built
    Then the page "pt/fe-e-obras/" does not contain "null"
    And the page "pt/fe-e-obras/" has no signature

  @OP-05.8
  Scenario: Text that looks like HTML is shown as text
    When the website is built
    Then the page "pt/fe-e-obras/" contains "Fé &amp; obras" and "Quem tem &lt;fé&gt; trabalha."

  @OP-05.9
  Scenario: No content files
    Given the content folder is empty
    When the website is built
    Then it fails with "No content files"

  @OP-05.13
  Scenario: A language without names and labels in website/languages.json
    Given the content also has the language "xx"
    When the website is built
    Then it fails with "Add \"xx\" to website/languages.json"

  # Bugs #67, #71: content/pt.json keeps fonteviva.org's Windows-1252 codes; pages show them as browsers do.
  @OP-05.20
  Scenario: Windows-1252 codes in the Portuguese text show as their characters
    Given the Portuguese message "o-tempo" ends its first paragraph with the Windows-1252 code 133
    When the website is built
    Then the page "pt/o-tempo/" contains "Primeiro parágrafo.…"

  @OP-05.15
  Scenario: Every language has its disclaimer, and every translated language its AI translation part
    Then every language in website/languages.json has a "disclaimer"
    And every language but "pt" in website/languages.json has a "translationDisclaimer"
