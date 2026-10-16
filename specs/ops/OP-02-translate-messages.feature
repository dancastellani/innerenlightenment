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
