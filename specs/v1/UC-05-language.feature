@UC-05 @v1
Feature: Read the message in English or Portuguese

  @UC-05.1
  Scenario: English by default
    Given the phone language is not Portuguese
    When I open the app for the first time
    Then messages are shown in English

  @UC-05.2
  Scenario: Portuguese phone
    Given the phone language is Portuguese
    When I open the app for the first time
    Then messages are shown in Portuguese

  @UC-05.3
  Scenario: Switch language
    Given messages are shown in English
    When I choose "Português" in settings
    Then the current message is shown in Portuguese
    And scheduled notifications are rescheduled in Portuguese with the same messages

  @UC-05.4
  Scenario: Both bundled languages work offline
    Given the device has no network connection
    When I switch between English and Portuguese
    Then both languages are available

  @UC-05.8
  Scenario: Translations say they were made by AI, without guarantee
    Given messages are shown in English
    Then the message says, in English, that it was translated from the Portuguese original by AI and is provided without guarantee
    And a message shown in Portuguese has no such note

  # Edge cases

  @UC-05.5
  Scenario: Any Portuguese variant
    Given the phone language is "pt-PT" or "pt-BR"
    When I open the app for the first time
    Then messages are shown in Portuguese

  @UC-05.6
  Scenario: A language the app does not have yet
    Given the phone language is Spanish and Spanish is not available
    When I open the app for the first time
    Then messages are shown in English

  @UC-05.7
  Scenario: A message missing from the translation
    Given messages are shown in English
    And today's message has no English translation
    When I open the app
    Then today's message is shown in Portuguese
