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
