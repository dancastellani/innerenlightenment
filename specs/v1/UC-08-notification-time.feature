@UC-08 @v1
Feature: Change the notification time

  @UC-08.1
  Scenario: Pick a new time
    Given notifications are scheduled for 08:00
    When I set the time to 07:30 in settings
    Then all scheduled notifications are at 07:30
    And each day keeps the same message it had before

  @UC-08.2
  Scenario: Time survives restarts
    Given I set the time to 07:30
    When the app is closed and reopened
    Then settings show 07:30

  @UC-08.8
  Scenario: Settings have their own screen
    Given I am reading a message
    When I open the menu at the top right and tap "Settings"
    Then a Settings screen shows the notification switch and the time
    When I tap "Back"
    Then I see the message again

  # Edge cases

  @UC-08.3
  Scenario Outline: Earliest and latest times of the day
    When I set the time to <time> in settings
    Then all scheduled notifications are at <time>

    Examples:
      | time  |
      | 00:00 |
      | 23:59 |

  @UC-08.4
  Scenario: New time already passed today
    Given it is 09:00 and today's notification was not delivered yet
    When I set the time to 08:30
    Then no notification is scheduled for today
    And the first notification is tomorrow at 08:30

  @UC-08.5
  Scenario: New time still to come today
    Given it is 07:00
    When I set the time to 07:01
    Then today's notification is at 07:01

  @UC-08.6
  Scenario: Picking the time is cancelled
    Given the time is 08:00
    When I open the time picker and cancel it
    Then the time stays 08:00 and nothing is rescheduled

  @UC-08.7
  Scenario: A time that the clock change skips
    Given the time is 02:30
    And the clocks go forward from 02:00 to 03:00 on one day
    Then that day's notification is delivered once, at 03:30
