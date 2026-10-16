@UC-01 @v1
Feature: Receive a message every day at 8am
  As a reader, I receive one uplifting message every morning,
  without needing a network connection.

  Background:
    Given the app is installed and has been opened once
    And notification permission is granted

  @UC-01.1
  Scenario: Default daily schedule
    Given I have not changed the notification time
    Then a notification is scheduled for 08:00 device time on each of the next 14 days

  @UC-01.2
  Scenario: Notification content
    When the 08:00 notification for a day is delivered
    Then its title is the message header (title), never an id
    And its body is the first line of the message text

  @UC-01.3
  Scenario: Works offline
    Given the device has no network connection
    When the 08:00 notification is due
    Then the notification is delivered

  @UC-01.4
  Scenario: Queue is topped up when the app opens
    Given only 5 notifications remain scheduled
    When I open the app
    Then notifications are scheduled for the next 14 days
    And no day has more than one daily notification

  @UC-01.5
  Scenario: Each day gets a random message
    When the next 14 days are scheduled
    Then each day gets a message picked at random from all messages
