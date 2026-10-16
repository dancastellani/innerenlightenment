@UC-03 @v1
Feature: See today's message when I open the app

  @UC-03.1
  Scenario: Home shows the same message as the notification
    Given today's notification announced message "pao-nosso/7"
    When I open the app
    Then the home screen shows message "pao-nosso/7"

  @UC-03.2
  Scenario: Message layout
    When a message is shown
    Then I see its book, chapter, title, body paragraphs and signature

  @UC-03.3
  Scenario: Notifications are off
    Given notifications are turned off
    When I open the app on a new day
    Then the home screen shows a message chosen for today
    And it stays the same for the rest of the day
