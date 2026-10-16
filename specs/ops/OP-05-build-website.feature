@OP-05 @ops
Feature: Build the website
  scripts/build-site.ts turns content/<lang>.json into static pages for GitHub Pages (issue #35).
  Each message has its own page at <lang>/<slug>/, the link the app can share.

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
    And the page "en/o-tempo/" links to "https://fonteviva.org/fonte-viva/o-tempo/"

  @OP-05.3
  Scenario: A message page links to the same message in the other languages
    When the website is built
    Then the page "en/o-tempo/" links to "../../pt/o-tempo/"
    And the page "pt/o-tempo/" links to "../../en/o-tempo/"

  @OP-05.4
  Scenario: The landing page lists the languages and credits fonteviva.org
    When the website is built
    Then the page "" links to "pt/" and "en/"
    And the page "" contains "fonteviva.org", "Marcelo Paiva" and "not responsible or liable"

  @OP-05.5
  Scenario: A language page lists its messages by book
    When the website is built
    Then the page "pt/" contains "Fonte Viva"
    And the page "pt/" links to "o-tempo/" and "fe-e-obras/"

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
