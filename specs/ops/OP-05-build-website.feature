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
    And the page "en/o-tempo/" links to "https://fonteviva.org/fonte-viva/o-tempo/"

  @OP-05.3
  Scenario: A message page links to the same message in the other languages
    When the website is built
    Then the page "en/o-tempo/" links to "../../pt/o-tempo/"
    And the page "pt/o-tempo/" links to "../../en/o-tempo/"

  @OP-05.16
  Scenario: A message page shows which language is selected
    When the website is built
    Then the page "pt/o-tempo/" marks "Português" as the selected language
    And the page "en/o-tempo/" marks "English" as the selected language

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
  Scenario: Every message page credits fonteviva.org
    When the website is built
    Then the page "pt/o-tempo/" contains "Marcelo Paiva" and "not responsible or liable"

  @OP-05.14
  Scenario: A translated message says it was translated by AI, without guarantee
    When the website is built
    Then the page "en/o-tempo/" contains "translated from the Portuguese original by AI" and "without guarantee"
    And the page "pt/o-tempo/" does not contain "translated from the Portuguese original"

  @OP-05.5
  Scenario: A language page lists its messages by book
    When the website is built
    Then the page "pt/" contains "Fonte Viva"
    And the page "pt/" links to "o-tempo/" and "fe-e-obras/"

  @OP-05.12
  Scenario: Every merge publishes the website
    Then the "Website" workflow runs on every push to main
    And it runs "./run.sh site"
    And it publishes the "site" folder with GitHub Pages

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

  @OP-05.15
  Scenario: Every translated language has its AI translation disclaimer
    Then every language but "pt" in website/languages.json has a "translationDisclaimer"
