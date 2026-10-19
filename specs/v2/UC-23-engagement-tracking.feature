@UC-23 @v2 @pending
Feature: Anonymous engagement tracking

  @UC-23.1
  Scenario: An interaction is counted
    Given tracking is on
    When I tap "Another message"
    Then the event "another_message" is counted once with my language
    And nothing that identifies me or the message text is sent

  @UC-23.2
  Scenario: Turn tracking off
    Given tracking is on
    When I turn it off in settings
    Then no further events are sent
    And the choice is kept after I close and reopen the app

  @UC-23.3
  Scenario: Turn tracking back on
    Given tracking is off
    When I turn it on in settings
    Then events are sent again

  @UC-23.4
  Scenario: The website opt-out
    When I choose "Do not count my visits" in the footer
    Then no events are sent from the website
    And the choice is kept in this browser

  @UC-23.5
  Scenario: The browser asks not to be tracked
    Given the browser sends Do Not Track
    When I open a page
    Then no event is sent

  # Edge cases

  @UC-23.6
  Scenario: No network
    Given the device has no network connection
    When I use the app
    Then the app works as usual and no error is shown
    And the missed events are dropped, not queued

  @UC-23.7
  Scenario: The counting service fails
    Given the endpoint answers with an error
    When I use the app or the website
    Then nothing is shown to me and nothing is retried
