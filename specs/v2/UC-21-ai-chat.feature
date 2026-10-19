@UC-21 @v2
Feature: AI Chat about the message

  The gem's link takes no prefilled text, so the message is copied to the clipboard and the user pastes it.

  @UC-21.1
  Scenario: The app copies the message and opens the AI chat
    Given I am viewing a message
    When I tap "AI Chat"
    Then the title, text and signature of the message are copied to the clipboard
    And "https://gemini.google.com/gem/da65ec0154b8" opens in an in-app browser tab

  @UC-21.2
  Scenario: The website copies the message and opens the AI chat
    Given I am viewing a message page
    When I click "AI Chat"
    Then the title, text and signature of the message are copied to the clipboard
    And "https://gemini.google.com/gem/da65ec0154b8" opens
