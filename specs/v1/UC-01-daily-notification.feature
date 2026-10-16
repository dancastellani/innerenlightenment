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
  Scenario: Messages do not repeat soon
    When the next 14 days are scheduled
    Then no message appears twice among them
    And no message shown in the last 90 days is scheduled

  # Edge cases

  @UC-01.6
  Scenario: App first opened after today's notification time
    Given it is 08:01
    When I open the app for the first time
    Then no notification is scheduled for today
    And the first notification is tomorrow at 08:00

  @UC-01.7
  Scenario: App first opened just before today's notification time
    Given it is 07:59
    When I open the app for the first time
    Then the first notification is today at 08:00

  @UC-01.8
  Scenario: Opening the app several times a day
    When I open the app 3 times on the same day
    Then each day still has exactly one notification with the same message

  @UC-01.9
  Scenario: Across the end of the month and the year
    Given it is 2026-12-25 at 09:00
    When I open the app
    Then notifications run from 2026-12-26 to 2027-01-08 with one notification each

  @UC-01.10
  Scenario: Daylight saving time starts or ends
    Given the clocks change during the next 14 days
    Then every notification is still at 08:00 device time

  @UC-01.11
  Scenario: Travelling to another time zone
    Given notifications were scheduled in São Paulo time
    When the phone moves to New York time
    Then the notifications are at 08:00 New York time

  @UC-01.12
  Scenario: Phone restarted
    Given notifications are scheduled
    When the phone is restarted
    Then the notifications are still delivered

  @UC-01.13
  Scenario: A planned message is no longer in the content
    Given today's planned message was removed from the content in an app update
    When I open the app
    Then today gets another message that was not shown recently
    And its notification and the home screen show that message
