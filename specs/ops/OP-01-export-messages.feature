@OP-01 @ops
Feature: Export the messages from fonteviva.org
  The export downloads every message from the site's WordPress API
  and writes them to content/pt.json, the file the app bundles.
  These scenarios run against saved sample data, not the real site.

  Background:
    Given the site has the saved sample of 3 messages in 2 books

  @OP-01.1
  Scenario: Every message is exported, across all pages
    Given the site returns 2 messages per page
    When the export runs
    Then it succeeds
    And the output has 3 messages
    And every message has a book, title, chapter and body

  @OP-01.2
  Scenario: Message fields are cleaned from the site's HTML
    When the export runs
    Then message 1485 has the title "Brilhe vossa luz", the chapter "Prefácio" and the signature "Emmanuel"

  # Bugs #67, #71: codes 128 to 159 are Windows-1252 characters, as browsers show them.
  @OP-01.6
  Scenario: Windows-1252 character codes become the characters a browser shows
    Given message 1485 has the paragraph "reencarnações&#133; Os homens d&#146;outrora"
    When the export runs
    Then the exported message 1485 has the paragraph "reencarnações… Os homens d’outrora"

  @OP-01.3
  Scenario: Only books with messages are listed
    When the export runs
    Then the output lists the books "fonte-viva" with 1 message and "vinha-de-luz" with 2 messages

  @OP-01.4
  Scenario: A message without a book is reported
    Given message 2001 has no book
    When the export runs
    Then it succeeds
    And it warns about "https://fonteviva.org/fonte-viva/a-fonte/"

  @OP-01.5
  Scenario: A site error stops the export
    Given the site answers every request with an error
    When the export runs
    Then it fails
    And no output file is written
