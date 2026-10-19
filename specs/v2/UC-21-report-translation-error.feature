@UC-21 @v2
Feature: Report a translation error

  @UC-21.1
  Scenario: Report an error
    Given a message is shown in a translation
    When I tap "Report an error", write what is wrong and send it
    Then I see a thank-you and the report reaches the project

  @UC-21.2
  Scenario: Say which paragraph and suggest a fix
    Given I am reporting an error
    When I choose a paragraph and type the text I think is right
    Then the report includes the paragraph number and my suggestion

  @UC-21.3
  Scenario: The original has no report button
    Given messages are shown in Portuguese
    Then I do not see "Report an error"

  @UC-21.4
  Scenario: On the website
    Given I am on a translated message page
    When I fill in and send the "Report an error" form
    Then I see a thank-you and the report reaches the project

  # Edge cases

  @UC-21.5
  Scenario: Empty comment
    Given I am reporting an error
    When I send it with no comment
    Then it is not sent and I am asked to say what is wrong

  @UC-21.6
  Scenario: Comment at and over the limit
    Given the comment limit is 1000 characters
    When I send exactly 1000 characters, it is sent
    And when I send 1001 characters, it is not sent and I see the limit

  @UC-21.7
  Scenario: Offline
    Given the device is offline
    When I send a report
    Then I see that it could not be sent and my text is kept so I can try again

  @UC-21.8
  Scenario: In Portuguese UI text
    Given the app language is Portuguese but I read a Spanish message
    Then the report form is in Portuguese
