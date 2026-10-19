@UC-21 @v2
Feature: Send feedback

  Only the "translation error" type exists for now; more types are added later.

  @UC-21.1
  Scenario: Report a translation error
    Given a message is shown in a translation
    When I tap "Send feedback", choose "Translation error", write what is wrong and send it
    Then I see a thank-you and the report reaches the project

  @UC-21.2
  Scenario: Say which paragraph and suggest a fix
    Given I am reporting a translation error
    When I choose a paragraph and type the text I think is right
    Then the report includes the paragraph number and my suggestion

  @UC-21.3
  Scenario: The original has no translation report
    Given messages are shown in Portuguese
    When I tap "Send feedback"
    Then "Translation error" is not offered

  @UC-21.4
  Scenario: On the website
    Given I am on a translated message page
    When I fill in and send the feedback form
    Then I see a thank-you and the report reaches the project

  # Edge cases

  @UC-21.5
  Scenario: Empty comment
    Given I am sending feedback
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
    When I send feedback
    Then I see that it could not be sent and my text is kept so I can try again

  @UC-21.8
  Scenario: The form is in the app language
    Given the app language is Portuguese but I read a Spanish message
    Then the feedback form is in Portuguese
