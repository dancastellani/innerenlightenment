@OP-02 @ops @pending
Feature: Translate the messages into another language
  The translation turns content/pt.json into content/<lang>.json with an LLM, once per language.
  These scenarios are @pending: their step definitions come once the translate script is merged.

  Background:
    Given content/pt.json has 3 messages

  @OP-02.1
  Scenario: Every message is translated
    When the translation into "en" runs
    Then content/en.json has 3 messages and the language "en"
    And each message keeps its id, book, address and number of paragraphs
    And each translated message is logged with its Portuguese and translated titles, like "translated: Nos mesmos pratos -> In the Same Dishes"

  @OP-02.5
  Scenario: The book names are translated too (#115)
    When the translation into "en" runs
    Then each book of content/pt.json is in content/en.json with its slug and its name in English

  @OP-02.6
  Scenario: A book added later is translated, the others are not sent again
    Given content/en.json already has the translated names of 3 of the 4 books
    When the translation into "en" runs
    Then only the name of the new book is sent to be translated
    And the other 3 book names stay as they are

  @OP-02.2
  Scenario: An interrupted run resumes where it stopped
    Given content/en.json already has 2 of the 3 messages
    When the translation into "en" runs
    Then only the missing message is sent to be translated
    And content/en.json has 3 messages in the same order as content/pt.json

  @OP-02.3
  Scenario: A translation with a different number of paragraphs is skipped
    Given the translator returns one message with a paragraph missing
    When the translation into "en" runs
    Then that message is left out with a warning naming its address
    And the other 2 messages are saved

  @OP-02.4
  Scenario: The translator is busy
    Given the translator answers "too many requests" once
    When the translation into "en" runs
    Then it waits and tries again
    And content/en.json has 3 messages

  @OP-02.5
  Scenario: The API key is missing
    Given GEMINI_API_KEY is not set
    When the translation into "en" runs
    Then it fails asking for GEMINI_API_KEY

  @OP-02.6
  Scenario: The translator answers with broken JSON
    Given the translator answers once with JSON that does not parse, such as unescaped quotes
    When the translation into "zh" runs
    Then that batch is counted as failed with a warning, and the run goes on
    And running the translation again translates the failed messages

  @OP-02.7
  Scenario: A Bible reference with different numbers is reported
    Given a message whose epigraph ends with "(Mateus, 14.19)"
    When its translation ends with "(Matthew, 14.39)"
    Then the translation check reports that the Bible reference changed
    But "(Matthew, 14:19)" and "(II Timóteo, 2.7)" written as "(2 Timothy, 2.7)" pass

  @OP-02.8
  Scenario: The labels are translated with the messages
    Given content/en.json has the labels "Settings" and "Share"
    When the translation into "es" runs
    Then content/es.json has the same labels, translated, next to the messages

  @OP-02.9
  Scenario: Labels already translated are not translated again
    Given content/es.json already has all the labels
    When the translation into "es" runs
    Then no request is made for the labels

  @OP-02.10
  Scenario: A translation with a missing label or a label left in English is reported
    Given content/en.json has the label "settings"
    When content/es.json has no "settings" label, or the English text of a label of 5 words or more
    Then the translation check reports the label
