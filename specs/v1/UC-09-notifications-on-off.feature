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
    Then notifications are scheduled for the next 30 days at my chosen time

  @UC-09.3
  Scenario: System permission denied
    Given notification permission is denied in the system settings
    When I open notification settings in the app
    Then the app explains that notifications are blocked
    And offers a button that opens the system settings for the app
