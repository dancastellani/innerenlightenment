@UC-02 @v1
Feature: Open today's message from the notification

  @UC-02.1
  Scenario: Tapping the notification opens that message
    Given a notification for message "fonte-viva/42" was delivered
    When I tap the notification
    Then the reader shows message "fonte-viva/42"

  @UC-02.2
  Scenario: App was closed
    Given the app is not running
    When I tap a delivered notification
    Then the app starts and shows the notified message in the reader
