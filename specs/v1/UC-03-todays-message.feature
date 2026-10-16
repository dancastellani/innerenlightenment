@UC-03 @v1
Feature: See today's message when I open the app

  @UC-03.1
  Scenario: Home shows the same message as the notification
    Given today's notification announced message A
    When I open the app
    Then the home screen shows message A

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

  # Edge cases

  # Regression for #49: the app showed yesterday's message when resumed.
  @UC-03.4
  Scenario: App left open past midnight
    Given the app shows today's message A
    When the app is brought back to the front on the next day
    Then the home screen shows the next day's message
    And notifications are topped up for the next 14 days

  @UC-03.5
  Scenario: Message without a signature
    Given a message has no signature
    When it is shown
    Then no empty signature line is shown
