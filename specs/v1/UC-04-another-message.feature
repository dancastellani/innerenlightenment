@UC-04 @v1
Feature: Ask for another message

  @UC-04.1
  Scenario: Random message
    Given I am viewing a message
    When I tap "Another message"
    Then a different message is shown

  @UC-04.2
  Scenario: Avoid recent messages
    When I tap "Another message"
    Then the message shown is not one shown in the last 90 days

  @UC-04.3
  Scenario: Every message was shown recently
    Given every message was shown in the last 90 days
    When I tap "Another message"
    Then a new round starts: earlier messages can come back
    But not the messages for today or the upcoming days
