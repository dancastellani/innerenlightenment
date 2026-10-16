@UC-09 @v1
Feature: Turn notifications off and on

  @UC-09.1
  Scenario: Turn off
    Given notifications are on
    When I turn notifications off in settings
    Then no notifications remain scheduled

  @UC-09.2
  Scenario: Turn back on
    Given notifications are off
    When I turn notifications on
    Then notifications are scheduled for the next 14 days at my chosen time

  @UC-09.3
  Scenario: System permission denied
    Given notification permission is denied in the system settings
    When I open notification settings in the app
    Then the app explains that notifications are blocked
    And offers a button that opens the system settings for the app

  # Edge cases

  @UC-09.4
  Scenario: Permission granted later in the system settings
    Given notification permission was denied
    And I allow notifications for the app in the system settings
    When I open the app again
    Then notifications are scheduled for the next 14 days at my chosen time
    And the "blocked" explanation is gone

  @UC-09.5
  Scenario: Turned off and on again after today's time
    Given it is 09:00 and today's notification time is 08:00
    When I turn notifications off and on again
    Then no notification is scheduled for today
    And tomorrow's notification has the same message as before

  @UC-09.6
  Scenario: Off survives restarts
    Given I turned notifications off
    When the app is closed and reopened
    Then notifications are still off and none are scheduled
