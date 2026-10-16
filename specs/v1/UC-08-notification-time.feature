@UC-08 @v1
Feature: Change the notification time

  @UC-08.1
  Scenario: Pick a new time
    Given notifications are scheduled for 06:00
    When I set the time to 07:30 in settings
    Then all scheduled notifications are at 07:30
    And each day keeps the same message it had before

  @UC-08.2
  Scenario: Time survives restarts
    Given I set the time to 07:30
    When the app is closed and reopened
    Then settings show 07:30
