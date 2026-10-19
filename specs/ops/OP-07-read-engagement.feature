@OP-07 @ops @v2 @pending
Feature: Count and read engagement events

  @OP-07.1
  Scenario: Count a known event
    When an event "shared" with language "en" is posted
    Then the day's count for "shared" and "en" goes up by one

  @OP-07.2
  Scenario: Refuse an unknown event
    When an event named "anything_else" is posted
    Then it is refused and nothing is stored

  @OP-07.6
  Scenario: Refuse an event with extra fields
    When an event with an id or a free text field is posted
    Then it is refused and nothing is stored

  @OP-07.3
  Scenario: No personal data is stored
    When an event is posted
    Then the stored row has only the day, the event name, the language and, for app opens, the age bucket

  @OP-07.4
  Scenario: Read the numbers
    When Dan queries the counts for the last 7 days
    Then he sees opens, shares and language changes per day and per language

  # Edge cases

  @OP-07.5
  Scenario: Too many events from one source
    When one IP posts events faster than the limit
    Then the extra events are refused

  @OP-07.7
  Scenario: Country comes from the request, not from the app
    When an event is posted from Brazil
    Then the stored row has country "BR" and no IP address

  @OP-07.8
  Scenario: Only coarse browser and OS names are kept
    When an event is posted with a full User-Agent header
    Then the stored row has only the browser family and OS family

  @OP-07.9
  Scenario: Refuse an error code that is not on the list
    When an "error" event with a free text code is posted
    Then it is refused and nothing is stored
