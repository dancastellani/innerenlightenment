@OP-07 @ops
Feature: Count and read engagement events

  @OP-07.1
  Scenario: Count a known event
    When an event "shared" with language "en" is posted
    Then the day's count for "shared" and "en" goes up by one

  @OP-07.2
  Scenario: Refuse an unknown event or extra fields
    When an event named "anything_else" is posted
    Or an event with an id or free text field is posted
    Then it is refused and nothing is stored

  @OP-07.3
  Scenario: No personal data is stored
    When an event is posted
    Then the stored row has only the day, the event name and the language

  @OP-07.4
  Scenario: Read the numbers
    When Dan queries the counts for the last 7 days
    Then he sees opens, shares and language changes per day and per language

  # Edge cases

  @OP-07.5
  Scenario: Too many events from one source
    When one IP posts events faster than the limit
    Then the extra events are refused
